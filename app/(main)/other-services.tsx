import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AF } from '../../lib/authTheme';

const SERVICES = [
  { label: 'Cabs', icon: 'car-outline' as const, route: '/(main)/cabs' },
  { label: 'Hotels', icon: 'bed-outline' as const, route: '/(main)/hotels' },
  { label: 'Visa Guidance', icon: 'document-text-outline' as const, route: '/(main)/visa' },
  { label: 'Airport Pickup', icon: 'airplane-outline' as const, route: '/(main)/pickup' },
  { label: 'Hospital Consultation', icon: 'medkit-outline' as const, route: '/(main)/hospital-consultation' },
  { label: 'Flight Ticket', icon: 'ticket-outline' as const, route: '/(main)/flight-ticket' },
];

export default function OtherServicesScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { fontFamily: AF.bold }]}>Other Services</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.grid}>
          {SERVICES.map((item) => (
            <TouchableOpacity 
              key={item.label} 
              style={s.serviceBtn} 
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <View style={s.serviceIconCircle}>
                <Ionicons name={item.icon} size={32} color="#dabf7e" />
              </View>
              <Text style={[s.serviceLabel, { fontFamily: AF.medium }]} numberOfLines={2}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ede6df' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#000000',
  },
  content: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 30,
    columnGap: 10,
  },
  serviceBtn: {
    alignItems: 'center',
    width: '30%', // 3 columns
  },
  serviceIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#305c5d',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceLabel: {
    fontSize: 13,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 18,
  },
});
