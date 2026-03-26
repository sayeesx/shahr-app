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
    Easing,
    cancelAnimation,
} from 'react-native-reanimated';
import { AC, AR, AS, AF } from '../../lib/authTheme';

// ─── Spinner ──────────────────────────────────────────────────────────────────
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
            <View style={styles.spinnerRing} />
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

export function AuthButton({
    label,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',
}: AuthButtonProps) {
    const scale = useSharedValue(1);

    const pressIn = () => {
        if (!loading && !disabled) {
            scale.value = withTiming(0.975, { duration: 80 });
        }
    };
    const pressOut = () => {
        scale.value = withTiming(1, { duration: 120 });
    };

    const containerAnim = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const isPrimary = variant === 'primary';
    const isDisabled = loading || disabled;

    return (
        <Animated.View style={[styles.wrap, containerAnim]}>
            <TouchableOpacity
                style={[
                    styles.btn,
                    isPrimary ? styles.primary : styles.outline,
                    isDisabled && styles.dimmed,
                ]}
                onPress={onPress}
                onPressIn={pressIn}
                onPressOut={pressOut}
                disabled={isDisabled}
                activeOpacity={0.85}
            >
                <View style={styles.row}>
                    {loading && <Spinner visible={true} />}
                    <Text
                        style={[
                            styles.label,
                            isPrimary ? styles.labelPrimary : styles.labelOutline,
                            loading && { marginLeft: 8 },
                        ]}
                    >
                        {label}
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
        borderColor: AC.primaryPress,
    },

    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: AC.border,
    },

    dimmed: { opacity: 0.65 },

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

    // ── Spinner ──
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
        borderColor: AC.text,
        borderTopColor: 'transparent',
    },
});