// components/auth/AuthField.tsx
import React, { useState, useEffect, useRef } from 'react';
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
    interpolate,
    interpolateColor,
    Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { AC, AR, AS, AF } from '../../lib/authTheme';

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
    const inputRef = useRef<TextInput>(null);

    // 0 = resting (placeholder centered), 1 = floated (label at top)
    const progress = useSharedValue(value ? 1 : 0);
    const borderProgress = useSharedValue(0);
    const errOpacity = useSharedValue(0);
    const errTranslateY = useSharedValue(-4);

    const TIMING = { duration: 200, easing: Easing.out(Easing.quad) };

    const handleFocus = () => {
        setFocused(true);
        progress.value = withTiming(1, TIMING);
        borderProgress.value = withTiming(1, { duration: 200 });
    };

    const handleBlur = () => {
        setFocused(false);
        borderProgress.value = withTiming(0, { duration: 200 });
        if (!value) {
            progress.value = withTiming(0, TIMING);
        }
    };

    // Sync with external value changes
    useEffect(() => {
        if (value && progress.value === 0) {
            progress.value = withTiming(1, TIMING);
        }
        if (!value && !focused) {
            progress.value = withTiming(0, TIMING);
        }
    }, [value]);

    // Error animation
    useEffect(() => {
        if (error) {
            errOpacity.value = withTiming(1, { duration: 180 });
            errTranslateY.value = withTiming(0, { duration: 200 });
        } else {
            errOpacity.value = withTiming(0, { duration: 140 });
            errTranslateY.value = -4;
        }
    }, [error]);

    // ── Animated styles ─────────────────────────────────────────────────────

    const borderStyle = useAnimatedStyle(() => {
        const borderColor = interpolateColor(
            borderProgress.value,
            [0, 1],
            [error ? AC.error : AC.borderSubtle, error ? AC.error : AC.border],
        );
        return { borderColor };
    });

    // Label animates: resting at vertical center → floated to top-left
    const labelStyle = useAnimatedStyle(() => {
        // translateY: 0 (centered) → -12 (pushed up above center)
        const translateY = interpolate(progress.value, [0, 1], [0, -14]);
        const fontSize = interpolate(progress.value, [0, 1], [15, 10.5]);
        const color = interpolateColor(
            progress.value,
            [0, 1],
            [AC.textMuted, focused ? AC.text : AC.textSub],
        );
        return {
            transform: [{ translateY }],
            fontSize,
            color,
        };
    });

    const errStyle = useAnimatedStyle(() => ({
        opacity: errOpacity.value,
        transform: [{ translateY: errTranslateY.value }],
    }));

    const iconColor = error ? AC.error : focused ? AC.text : AC.textSub;

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => inputRef.current?.focus()}
            >
                <Animated.View style={[styles.field, borderStyle]}>
                    {/* ── Leading icon ── */}
                    <Ionicons name={iconName} size={17} color={iconColor} style={styles.icon} />

                    {/* ── Input + Label container ── */}
                    <View style={styles.inputArea}>
                        {/* Floating label — DM Sans */}
                        <Animated.Text
                            style={[styles.floatingLabel, { fontFamily: AF.regular }, labelStyle]}
                            pointerEvents="none"
                            numberOfLines={1}
                        >
                            {label}
                        </Animated.Text>

                        {/* Actual TextInput — pushed down when label is floated */}
                        {/* TextInput — DM Sans */}
                        <TextInput
                            ref={inputRef}
                            style={[
                                styles.input,
                                { fontFamily: AF.regular },
                                (focused || !!value) && styles.inputFloated,
                            ]}
                            value={value}
                            onChangeText={onChangeText}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            secureTextEntry={isPassword && !showPw}
                            placeholderTextColor="transparent"
                            selectionColor={AC.text}
                            {...rest}
                        />
                    </View>

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
                                color={AC.textSub}
                            />
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </TouchableOpacity>

            {/* ── Inline error — DM Sans for microcopy readability ── */}
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
        backgroundColor: AC.bg,
        borderRadius: AR.field,
        borderWidth: 1.5,
        height: AS.fieldHeight,
        paddingHorizontal: 20,
    },

    icon: {
        marginRight: 10,
    },

    // This container holds both the label and input stacked
    inputArea: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
    },

    // Label sits centered by default, animates up on focus
    floatingLabel: {
        position: 'absolute',
        left: 0,
        right: 0,
        letterSpacing: 0.2,
    },

    // Input occupies full height, text vertically centered by default
    input: {
        flex: 1,
        color: AC.text,
        fontSize: 15,
        letterSpacing: 0.2,
        paddingTop: 0,
        paddingBottom: 0,
    },

    // When label is floated, push input text downward so it doesn't overlap
    inputFloated: {
        paddingTop: 12,
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