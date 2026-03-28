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
} from 'react-native-reanimated';
import { AC, AR, AS, AF } from '../../lib/authTheme';
import { ActivityIndicator } from 'react-native';
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
                <View style={[styles.row, { height: '100%' }]}>
                    {loading ? (
                        <ActivityIndicator color={AC.accent} size="small" />
                    ) : (
                        <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelOutline, { fontFamily: AF.medium }]}>
                            {label}
                        </Text>
                    )}
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
        letterSpacing: 0.5,
        fontFamily: AF.medium,
    },
    labelPrimary: { color: AC.accent },
    labelOutline: { color: AC.text },
});