// components/auth/AuthToast.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AC, AF, AR } from '../../lib/authTheme';

export type ToastType = 'success' | 'error' | 'warning';

interface AuthToastProps {
    message: string;
    type: ToastType;
    visible: boolean;
}

const THEME = {
    primary: '#305c5d',
    card: '#fbf6f4',
    white: '#fff',
    error: '#c45c4a',
    warning: '#b8956a',
};

const CFG: Record<ToastType, { color: string; bg: string; border: string; icon: keyof typeof Ionicons.glyphMap }> = {
    success: { color: THEME.primary, bg: THEME.card, border: THEME.primary, icon: 'checkmark-circle-outline' },
    error: { color: THEME.error, bg: THEME.white, border: THEME.error, icon: 'alert-circle-outline' },
    warning: { color: THEME.warning, bg: THEME.white, border: THEME.warning, icon: 'warning-outline' },
};

export function AuthToast({ message, type, visible }: AuthToastProps) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-6)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
                Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 0 }),
            ]).start();
        } else {
            Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }).start();
            translateY.setValue(-6);
        }
    }, [visible]);

    const { color, bg, border, icon } = CFG[type];

    return (
        <Animated.View
            style={[
                styles.toast,
                { backgroundColor: bg, borderColor: border, opacity, transform: [{ translateY }] },
            ]}
        >
            <Ionicons name={icon} size={15} color={color} />
            <Text 
                style={[styles.msg, { color, fontFamily: AF.regular }]} 
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
            >
                {message}
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: AR.card,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 11,
        width: '100%',
    },
    msg: {
        fontSize: 13,
        flex: 1,
        lineHeight: 18,
        letterSpacing: 0.1,
    },
});