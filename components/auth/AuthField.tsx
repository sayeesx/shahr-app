// components/auth/AuthField.tsx
import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Text,
    TextInputProps,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    interpolate,
    interpolateColor,
    useAnimatedProps,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AC, AR, AS, AF } from '../../lib/authTheme';

// ─── Animated TextInput for border color ─────────────────────────────────────
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AuthFieldProps extends TextInputProps {
    label: string;
    iconName: keyof typeof Ionicons.glyphMap;
    error?: string;
    isPassword?: boolean;
}

export function AuthField({
    label,
    iconName,
    error,
    isPassword = false,
    value,
    onChangeText,
    ...rest
}: AuthFieldProps) {
    const [focused, setFocused] = useState(false);
    const [showPw, setShowPw] = useState(false);

    // 0 = idle/unfocused-empty  |  1 = focused or has-value-floated
    const floated = useSharedValue(value ? 1 : 0);
    // 0 = visible  |  1 = vanishing (on focus trigger)
    const vanish = useSharedValue(0);
    // border glow
    const borderProgress = useSharedValue(0);
    // error
    const errOpacity = useSharedValue(0);
    const errTranslateY = useSharedValue(-4);

    // ── Focus / blur ──────────────────────────────────────────────────────────
    const handleFocus = () => {
        setFocused(true);

        if (!value) {
            // Step 1: "blur-vanish" — scale up + fade to green + opacity 0
            vanish.value = withSequence(
                withTiming(1, {
                    duration: 320,
                    easing: Easing.out(Easing.cubic),
                }),
            );

            // Step 2: after vanish, snap label to floated mini position
            floated.value = withDelay(
                280,
                withTiming(1, { duration: 120, easing: Easing.out(Easing.quad) }),
            );
        }

        borderProgress.value = withTiming(1, { duration: 200 });
    };

    const handleBlur = () => {
        setFocused(false);
        borderProgress.value = withTiming(0, { duration: 200 });

        if (!value) {
            // Snap back: floated collapses, then label re-appears
            floated.value = withTiming(0, { duration: 180, easing: Easing.in(Easing.quad) });
            vanish.value = withDelay(
                140,
                withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) }),
            );
        }
    };

    // If value is set externally (prefill), keep floated
    useEffect(() => {
        if (value && !focused) {
            floated.value = withTiming(1, { duration: 200 });
            vanish.value = withTiming(0, { duration: 1 }); // instant reset
        }
        if (!value && !focused) {
            floated.value = withTiming(0, { duration: 200 });
        }
    }, [value]);

    // ── Error animation ───────────────────────────────────────────────────────
    useEffect(() => {
        if (error) {
            errOpacity.value = withTiming(1, { duration: 180 });
            errTranslateY.value = withTiming(0, { duration: 200 });
        } else {
            errOpacity.value = withTiming(0, { duration: 140 });
            errTranslateY.value = -4;
        }
    }, [error]);

    // ── Animated styles ───────────────────────────────────────────────────────

    // Border container
    const borderStyle = useAnimatedStyle(() => {
        const borderColor = interpolateColor(
            borderProgress.value,
            [0, 1],
            [error ? AC.error : AC.borderSubtle, error ? AC.error : AC.border],
        );
        return { borderColor };
    });

    // The BIG vanishing label (placeholder position, center-ish)
    const vanishLabelStyle = useAnimatedStyle(() => {
        // opacity: 1 → 0 as vanish goes 0 → 1
        const opacity = interpolate(vanish.value, [0, 0.6, 1], [1, 0.3, 0]);
        // scale: 1 → 1.18 (stretches outward like blur explosion)
        const scale = interpolate(vanish.value, [0, 1], [1, 1.18]);
        // slight upward drift
        const translateY = interpolate(vanish.value, [0, 1], [0, -6]);
        // color: textMuted → primary green as it vanishes
        const color = interpolateColor(vanish.value, [0, 1], [AC.textMuted, AC.primary]);

        // When floated=1, don't show this layer at all (mini label takes over)
        const floatHide = interpolate(floated.value, [0.8, 1], [1, 0]);

        return {
            opacity: opacity * floatHide,
            transform: [{ scale }, { translateY }],
            color,
        };
    });

    // The small floated label (top-left)
    const floatedLabelStyle = useAnimatedStyle(() => {
        // Only visible once fully floated
        const opacity = interpolate(floated.value, [0.7, 1], [0, 1]);
        const translateY = interpolate(floated.value, [0, 1], [4, 0]);
        const color = interpolateColor(
            borderProgress.value,
            [0, 1],
            [AC.textSub, AC.primary],
        );
        return { opacity, transform: [{ translateY }], color };
    });

    // Error text
    const errStyle = useAnimatedStyle(() => ({
        opacity: errOpacity.value,
        transform: [{ translateY: errTranslateY.value }],
    }));

    // Icon color (no reanimated needed — use state)
    const iconColor = focused ? AC.primary : AC.textMuted;

    return (
        <View style={styles.wrapper}>
            <Animated.View style={[styles.field, borderStyle]}>

                {/* ── Leading icon ── */}
                <Ionicons name={iconName} size={17} color={iconColor} style={styles.icon} />

                {/* ── Label layer ── */}
                <View style={styles.labelArea} pointerEvents="none">
                    {/* Big vanishing label — sits at placeholder position */}
                    <Animated.Text
                        style={[styles.bigLabel, { fontFamily: AF.regular }, vanishLabelStyle]}
                    >
                        {label}
                    </Animated.Text>

                    {/* Mini floated label — slides up from top */}
                    <Animated.Text
                        style={[styles.miniLabel, { fontFamily: AF.regular }, floatedLabelStyle]}
                    >
                        {label}
                    </Animated.Text>
                </View>

                {/* ── Input ── */}
                <TextInput
                    style={[styles.input, { fontFamily: AF.regular }]}
                    value={value}
                    onChangeText={onChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    secureTextEntry={isPassword && !showPw}
                    placeholderTextColor="transparent"
                    selectionColor={AC.primary}
                    {...rest}
                />

                {/* ── Eye toggle ── */}
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPw((v) => !v)}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        style={styles.eye}
                    >
                        <Ionicons
                            name={showPw ? 'eye-off-outline' : 'eye-outline'}
                            size={17}
                            color={AC.textMuted}
                        />
                    </TouchableOpacity>
                )}
            </Animated.View>

            {/* ── Inline error ── */}
            <Animated.Text style={[styles.errText, errStyle]}>
                {error ?? ''}
            </Animated.Text>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { width: '100%' },

    field: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEFCFE',
        borderRadius: AR.field,
        borderWidth: 1.5,
        height: AS.fieldHeight,
        paddingHorizontal: 20,
        position: 'relative',
        overflow: 'hidden',
    },

    // Sits just after the icon, takes remaining space, stacks the two labels
    labelArea: {
        position: 'absolute',
        left: 48,         // icon width + margin
        right: 48,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        pointerEvents: 'none',
    },

    // Full-size placeholder label that vanishes on focus
    bigLabel: {
        position: 'absolute',
        fontSize: 15,
        color: AC.textMuted,
        letterSpacing: 0.2,
        left: 0,
    },

    // Mini label that appears at top when floated
    miniLabel: {
        position: 'absolute',
        fontSize: 10.5,
        color: AC.textSub,
        letterSpacing: 0.2,
        top: 9,
        left: 0,
    },

    icon: {
        marginRight: 10,
    },

    input: {
        flex: 1,
        color: AC.text,
        fontSize: 15,
        height: '100%',
        paddingTop: 18,     // push text down so it sits below the mini label
        letterSpacing: 0.2,
    },

    eye: {
        marginLeft: 8,
    },

    errText: {
        color: AC.error,
        fontSize: 11.5,
        fontFamily: AF.regular,
        marginTop: 5,
        marginLeft: 22,
        letterSpacing: 0.1,
        minHeight: 15,
    },
});