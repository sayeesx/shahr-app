// components/auth/AuthButton.tsx
import React, { useRef } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    withDelay,
    Easing,
    cancelAnimation,
    runOnJS,
} from 'react-native-reanimated';
import { AC, AR, AS, AF } from '../../lib/authTheme';

// ─── Spinner SVG via Animated ─────────────────────────────────────────────────
function Spinner({ visible }: { visible: boolean }) {
    const rotation = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0);

    React.useEffect(() => {
        if (visible) {
            opacity.value = withTiming(1, { duration: 180 });
            scale.value = withTiming(1, { duration: 180 });
            rotation.value = withRepeat(
                withTiming(360, { duration: 700, easing: Easing.linear }),
                -1,
                false,
            );
        } else {
            cancelAnimation(rotation);
            opacity.value = withTiming(0, { duration: 180 });
            scale.value = withTiming(0, { duration: 180 });
        }
    }, [visible]);

    const animStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { scale: scale.value },
            { rotate: `${rotation.value}deg` },
        ],
    }));

    return (
        <Animated.View style={[styles.iconWrap, animStyle]}>
            {/* Circle arc → spinner ring */}
            <View style={styles.spinnerRing} />
            <View style={styles.spinnerGap} />
        </Animated.View>
    );
}

// ─── Check icon ───────────────────────────────────────────────────────────────
function CheckMark({ visible }: { visible: boolean }) {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0);

    React.useEffect(() => {
        if (visible) {
            opacity.value = withTiming(1, { duration: 180 });
            scale.value = withTiming(1, { duration: 180 });
        } else {
            opacity.value = withTiming(0, { duration: 180 });
            scale.value = withTiming(0, { duration: 180 });
        }
    }, [visible]);

    const animStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[styles.iconWrap, animStyle]}>
            {/* Simple check using two rectangles rotated */}
            <View style={styles.checkCircle}>
                <View style={styles.checkShort} />
                <View style={styles.checkLong} />
            </View>
        </Animated.View>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface AuthButtonProps {
    label: string;
    onPress: () => void | Promise<void>;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'outline';
}

// ─── Phase state ──────────────────────────────────────────────────────────────
type Phase = 'idle' | 'loading' | 'success';

export function AuthButton({
    label,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',
}: AuthButtonProps) {
    const scale = useSharedValue(1);
    const [phase, setPhase] = React.useState<Phase>('idle');
    const isMounted = useRef(true);

    React.useEffect(() => {
        return () => { isMounted.current = false; };
    }, []);

    // Mirror external loading prop so spinner shows even on first render if caller sets it
    React.useEffect(() => {
        if (loading && phase === 'idle') setPhase('loading');
        if (!loading && phase === 'loading') setPhase('idle');
    }, [loading]);

    const pressIn = () => {
        scale.value = withTiming(0.975, { duration: 80 });
    };
    const pressOut = () => {
        scale.value = withTiming(1, { duration: 120 });
    };

    const containerAnim = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePress = async () => {
        if (phase !== 'idle' || disabled) return;

        // 1. Show spinner
        setPhase('loading');

        // 2. Run the actual handler
        try {
            await onPress();
        } catch (_) {
            // swallow — caller handles errors via toast etc.
        }

        if (!isMounted.current) return;

        // 3. Show checkmark
        setPhase('success');

        // 4. Reset after 2 s
        setTimeout(() => {
            if (isMounted.current) setPhase('idle');
        }, 2000);
    };

    const isPrimary = variant === 'primary';
    const isDisabled = phase !== 'idle' || disabled;

    const showSpinner = phase === 'loading';
    const showCheck = phase === 'success';

    return (
        <Animated.View style={[styles.wrap, containerAnim]}>
            <TouchableOpacity
                style={[
                    styles.btn,
                    isPrimary ? styles.primary : styles.outline,
                    isDisabled && styles.dimmed,
                ]}
                onPress={handlePress}
                onPressIn={pressIn}
                onPressOut={pressOut}
                disabled={isDisabled}
                activeOpacity={1}
            >
                <View style={styles.row}>
                    <Spinner visible={showSpinner} />
                    <CheckMark visible={showCheck} />
                    <Text
                        style={[
                            styles.label,
                            isPrimary ? styles.labelPrimary : styles.labelOutline,
                            (showSpinner || showCheck) && { marginLeft: 8 },
                        ]}
                    >
                        {phase === 'success' ? 'Done!' : label}
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const ICON_SIZE = 20;

const styles = StyleSheet.create({
    wrap: { width: '100%' },

    btn: {
        width: '100%',
        height: AS.buttonHeight,
        borderRadius: AR.button,
        alignItems: 'center',
        justifyContent: 'center',
    },

    primary: {
        backgroundColor: AC.primary,
        borderWidth: 1.5,
        borderColor: AC.primary,
    },

    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: AC.border,
    },

    dimmed: { opacity: 0.72 },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    label: {
        fontSize: 15,
        letterSpacing: 0.6,
        fontFamily: AF.semibold,
    },
    labelPrimary: { color: AC.text },
    labelOutline: { color: AC.text },

    // ── Spinner ──────────────────────────────────────────────────────────────
    iconWrap: {
        width: ICON_SIZE,
        height: ICON_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },

    spinnerRing: {
        position: 'absolute',
        width: ICON_SIZE,
        height: ICON_SIZE,
        borderRadius: ICON_SIZE / 2,
        borderWidth: 2.5,
        borderColor: AC.text, // fully opaque — the gap covers one segment
        borderTopColor: 'transparent',
    },

    // Fills the top gap so it looks like a 270° arc
    spinnerGap: {
        position: 'absolute',
        top: 0,
        width: ICON_SIZE,
        height: ICON_SIZE / 2,
        // transparent overlay; the ring's borderTopColor:'transparent' handles it
    },

    // ── Check ────────────────────────────────────────────────────────────────
    checkCircle: {
        width: ICON_SIZE,
        height: ICON_SIZE,
        borderRadius: ICON_SIZE / 2,
        borderWidth: 2.5,
        borderColor: AC.text,
        alignItems: 'center',
        justifyContent: 'center',
    },

    checkShort: {
        position: 'absolute',
        width: 5,
        height: 2.5,
        backgroundColor: AC.text,
        borderRadius: 1,
        left: 4,
        top: 10,
        transform: [{ rotate: '45deg' }],
    },

    checkLong: {
        position: 'absolute',
        width: 8,
        height: 2.5,
        backgroundColor: AC.text,
        borderRadius: 1,
        left: 7,
        top: 8,
        transform: [{ rotate: '-45deg' }],
    },
});