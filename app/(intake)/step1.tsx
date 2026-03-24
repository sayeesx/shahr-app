import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { StepIndicator } from '../../components/intake/StepIndicator';
import type { IntakePurpose } from '../../types';

const PURPOSE_OPTIONS: {
  value: IntakePurpose;
  label: string;
  subtitle: string;
  icon: string;
  color: string;
}[] = [
  {
    value: 'medical',
    label: 'Medical Concierge',
    subtitle: 'Hospital coordination, treatment planning, recovery stay',
    icon: 'medkit-outline',
    color: '#0D3B5C',
  },
  {
    value: 'tourism',
    label: 'Tourism Planning',
    subtitle: 'Kerala experiences, drivers, stays, and activities',
    icon: 'partly-sunny-outline',
    color: '#2ba89a',
  },
  {
    value: 'nri',
    label: 'NRI Concierge',
    subtitle: 'Property, legal, family check-ins, return visits',
    icon: 'airplane-outline',
    color: '#8B5CF6',
  },
  {
    value: 'hybrid',
    label: 'Hybrid Journey',
    subtitle: 'Combined medical + travel for recuperative stays',
    icon: 'git-merge-outline',
    color: '#D97706',
  },
];

export default function IntakeStep1() {
  const { intakeDraft, updateDraft } = useAppStore();
  const selected = intakeDraft.purpose;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSelect = (purpose: IntakePurpose) => {
    updateDraft({ purpose });
  };

  const handleNext = () => {
    if (!selected) return;
    router.push('/(intake)/step2');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF8' }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: '#0D3B5C',
          paddingTop: 56,
          paddingBottom: 0,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ paddingHorizontal: 20, paddingBottom: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <Animated.View
          style={{ opacity: fadeAnim, paddingHorizontal: 24, paddingBottom: 28 }}
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
            Start Your Journey
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '800', lineHeight: 32 }}>
            What brings you{'\n'}to Kerala?
          </Text>
        </Animated.View>

        <StepIndicator currentStep={1} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          {PURPOSE_OPTIONS.map((option) => {
            const isSelected = selected === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                activeOpacity={0.85}
                onPress={() => handleSelect(option.value)}
                style={{
                  backgroundColor: isSelected ? option.color : '#FFFFFF',
                  borderRadius: 18,
                  padding: 20,
                  marginBottom: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: isSelected ? 0 : 1.5,
                  borderColor: '#E2E8F0',
                  shadowColor: isSelected ? option.color : '#0D3B5C',
                  shadowOffset: { width: 0, height: isSelected ? 6 : 2 },
                  shadowOpacity: isSelected ? 0.3 : 0.06,
                  shadowRadius: isSelected ? 14 : 8,
                  elevation: isSelected ? 6 : 2,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${option.color}15`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16,
                  }}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={22}
                    color={isSelected ? '#FFFFFF' : option.color}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '700',
                      color: isSelected ? '#FFFFFF' : '#0D3B5C',
                      marginBottom: 3,
                    }}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: isSelected ? 'rgba(255,255,255,0.75)' : '#64748B',
                      lineHeight: 18,
                    }}
                  >
                    {option.subtitle}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color="rgba(255,255,255,0.9)" />
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </ScrollView>

      {/* Continue Button */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: 36,
          paddingTop: 12,
          backgroundColor: '#FAFAF8',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
        }}
      >
        <TouchableOpacity
          activeOpacity={selected ? 0.85 : 1}
          onPress={handleNext}
          disabled={!selected}
          style={{
            backgroundColor: selected ? '#0D3B5C' : '#CBD5E1',
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            shadowColor: '#0D3B5C',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: selected ? 0.25 : 0,
            shadowRadius: 8,
            elevation: selected ? 5 : 0,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: '700',
            }}
          >
            Continue
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
