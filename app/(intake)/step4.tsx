import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';

export default function IntakeStep4() {
  const session = useAppStore((s) => s.session);
  const scale = useRef(new Animated.Value(0.8)).current;
  const fade  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0D3B5C', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Animated.View style={{ opacity: fade, transform: [{ scale }], alignItems: 'center' }}>
        {/* Pulse ring */}
        <View style={{
          width: 100, height: 100, borderRadius: 50,
          backgroundColor: 'rgba(236,201,75,0.15)',
          alignItems: 'center', justifyContent: 'center', marginBottom: 32,
        }}>
          <View style={{
            width: 72, height: 72, borderRadius: 36,
            backgroundColor: '#ECC94B',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="checkmark" size={36} color="#082540" />
          </View>
        </View>

        <Text style={{ color: '#ECC94B', fontSize: 13, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
          Request Received
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '800', textAlign: 'center', lineHeight: 36, marginBottom: 16 }}>
          AI is preparing{'\n'}your plan
        </Text>
        <Text style={{ color: '#94B8D0', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 48 }}>
          Our concierge team will review your request and craft a personalised plan. You'll be notified shortly.
        </Text>

        {session && (
          <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, width: '100%', marginBottom: 32 }}>
            <Text style={{ color: '#94B8D0', fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 6 }}>CONTACT ON FILE</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>{session.name}</Text>
            <Text style={{ color: '#94B8D0', fontSize: 13, marginTop: 2 }}>{session.phone}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.replace('/(dashboard)')}
          style={{
            backgroundColor: '#ECC94B', borderRadius: 14,
            paddingVertical: 15, paddingHorizontal: 36,
            flexDirection: 'row', alignItems: 'center', gap: 8,
          }}
        >
          <Text style={{ color: '#082540', fontSize: 16, fontWeight: '800' }}>View My Dashboard</Text>
          <Ionicons name="arrow-forward" size={18} color="#082540" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
