import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';

const { width } = Dimensions.get('window');

// ─── Trust Partners ───────────────────────────────────────────────────────────
const TRUST_ITEMS = [
  { icon: 'medical', label: 'KIMS Hospital' },
  { icon: 'car',     label: 'Verified Drivers' },
  { icon: 'home',    label: 'Local Partners' },
  { icon: 'shield-checkmark', label: 'NABH Hospitals' },
];

// ─── Steps ────────────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Submit Your Request',
    desc: 'Tell us your purpose — medical, tourism, or NRI needs. Takes 2 minutes.',
    icon: 'create-outline',
  },
  {
    step: '02',
    title: 'AI Builds Your Plan',
    desc: 'Our AI concierge curates a personalised itinerary, hospital suggestions, and transport.',
    icon: 'sparkles-outline',
  },
  {
    step: '03',
    title: 'We Execute',
    desc: 'Our on-ground team handles every detail — bookings, drivers, appointments.',
    icon: 'checkmark-circle-outline',
  },
];

// ─── Services ─────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    title: 'Medical\nConcierge',
    desc: 'Hospital coordination, doctor appointments, recovery stay',
    icon: 'medkit-outline',
    color: '#0D3B5C',
    route: '/(main)/services/medical' as const,
  },
  {
    title: 'Tourism\nPlanning',
    desc: 'Curated Kerala experiences, drivers, accommodations',
    icon: 'partly-sunny-outline',
    color: '#2ba89a',
    route: '/(main)/services/tourism' as const,
  },
  {
    title: 'NRI\nConcierge',
    desc: 'Property visits, legal support, family check-ins',
    icon: 'airplane-outline',
    color: '#8B5CF6',
    route: '/(main)/services/nri' as const,
  },
];

export default function HomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF8' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: '#0D3B5C',
            paddingTop: 64,
            paddingBottom: 52,
            paddingHorizontal: 28,
            borderBottomLeftRadius: 36,
            borderBottomRightRadius: 36,
          }}
        >
          {/* Top bar */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 40,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                backgroundColor: '#ECC94B',
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <Text style={{ color: '#082540', fontWeight: '900', fontSize: 18 }}>S</Text>
            </View>
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 20, letterSpacing: 1 }}>
              Shahr
            </Text>
          </Animated.View>

          {/* Headline */}
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text
              style={{
                color: '#ECC94B',
                fontSize: 13,
                fontWeight: '600',
                letterSpacing: 2,
                marginBottom: 12,
                textTransform: 'uppercase',
              }}
            >
              Your Private Concierge
            </Text>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 32,
                fontWeight: '800',
                lineHeight: 40,
                marginBottom: 16,
              }}
            >
              AI Travel & Medical{'\n'}
              <Text style={{ color: '#ECC94B' }}>Concierge</Text> for Kerala
            </Text>
            <Text
              style={{
                color: '#94B8D0',
                fontSize: 15,
                lineHeight: 23,
                marginBottom: 32,
              }}
            >
              From hospital corridors to backwater sunsets — we plan, coordinate, and execute every detail of your Kerala journey.
            </Text>

            {/* CTAs */}
            <Button
              title="Plan My Visit"
              variant="gold"
              onPress={() => router.push('/(intake)/step1')}
              style={{ marginBottom: 12 }}
            />
            <Button
              title="Explore Services"
              variant="secondary"
              onPress={() => {}}
              textStyle={{ color: '#CBD5E1' }}
              style={{ borderColor: 'rgba(255,255,255,0.3)' }}
            />
          </Animated.View>
        </View>

        {/* ── How It Works ──────────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 24, paddingTop: 44 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: '#2ba89a',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            How It Works
          </Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#0D3B5C', marginBottom: 28 }}>
            Three steps to{'\n'}your perfect stay
          </Text>

          {HOW_IT_WORKS.map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                marginBottom: 28,
                alignItems: 'flex-start',
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  backgroundColor: '#F0F9F8',
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                  borderWidth: 1,
                  borderColor: '#D1F5F0',
                }}
              >
                <Ionicons name={item.icon as any} size={22} color="#2ba89a" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: '#CBD5E1',
                    letterSpacing: 1.5,
                    marginBottom: 4,
                  }}
                >
                  {item.step}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0D3B5C', marginBottom: 4 }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 14, color: '#64748B', lineHeight: 20 }}>
                  {item.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Services ──────────────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 24, paddingTop: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#0D3B5C', marginBottom: 20 }}>
            Our Services
          </Text>

          {SERVICES.map((service, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.88}
              onPress={() => router.push(service.route)}
              style={{
                backgroundColor: service.color,
                borderRadius: 20,
                padding: 22,
                marginBottom: 14,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: service.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 18,
                }}
              >
                <Ionicons name={service.icon as any} size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16, marginBottom: 4 }}>
                  {service.title}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 18 }}>
                  {service.desc}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Trust Indicators ──────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 24, paddingTop: 32 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: '#94A3B8',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            Trusted Partners
          </Text>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 12,
            }}
          >
            {TRUST_ITEMS.map((item, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  shadowColor: '#0D3B5C',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <Ionicons name={item.icon as any} size={16} color="#2ba89a" />
                <Text style={{ fontSize: 13, color: '#334155', fontWeight: '600' }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
        <View
          style={{
            marginHorizontal: 24,
            marginTop: 40,
            backgroundColor: '#0D3B5C',
            borderRadius: 24,
            padding: 28,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: '#ECC94B',
              fontSize: 12,
              fontWeight: '700',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Ready to begin?
          </Text>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 20,
              fontWeight: '800',
              textAlign: 'center',
              marginBottom: 20,
              lineHeight: 27,
            }}
          >
            Your Kerala journey{'\n'}starts with one tap.
          </Text>
          <Button
            title="Plan My Visit →"
            variant="gold"
            onPress={() => router.push('/(intake)/step1')}
          />
        </View>
      </ScrollView>
    </View>
  );
}
