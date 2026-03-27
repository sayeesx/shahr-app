import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AF } from '../../lib/authTheme';

export default function AiPlannerScreen() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={[s.title, { fontFamily: AF.bold }]}>AI Trip Planner</Text>
        <View style={s.placeholderBtn} />
      </View>

      <View style={s.content}>
        <Ionicons name="sparkles-outline" size={80} color="#305c5d" style={s.icon} />
        <Text style={[s.emptyTitle, { fontFamily: AF.semibold }]}>Smart Itinerary Builder</Text>
        <Text style={[s.emptyDesc, { fontFamily: AF.medium }]}>
          Let our AI understand your preferences and curate the perfect tailored journey just for you.
        </Text>
        <TouchableOpacity style={s.actionBtn} activeOpacity={0.8}>
          <Text style={[s.actionBtnText, { fontFamily: AF.semibold }]}>Start Planning</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ede6df' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    color: '#000000',
    letterSpacing: -0.5,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fbf6f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderBtn: {
    width: 44,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    marginBottom: 24,
    opacity: 0.9,
  },
  emptyTitle: {
    fontSize: 22,
    color: '#000000',
    marginBottom: 12,
  },
  emptyDesc: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  actionBtn: {
    backgroundColor: '#305c5d',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 100,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
