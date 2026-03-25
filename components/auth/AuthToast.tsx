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

const CFG: Record<ToastType, { color: string; bg: string; border: string; icon: keyof typeof Ionicons.glyphMap }> = {
    success: { color: AC.success, bg: '#F0FBF4', border: 'rgba(58,158,106,0.3)', icon: 'checkmark-circle-outline' },
    error: { color: AC.error, bg: '#FDF2F2', border: 'rgba(201,64,64,0.3)', icon: 'alert-circle-outline' },
    warning: { color: AC.warning, bg: '#FDF8EE', border: 'rgba(192,122,16,0.3)', icon: 'warning-outline' },
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
            <Text style={[styles.msg, { color, fontFamily: AF.regular }]}>{message}</Text>
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