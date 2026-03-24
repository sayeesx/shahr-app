import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';

const SERVICES = [
  { icon: 'home-outline',           title: 'Property Visits',        desc: 'Verified property inspections, vastu consultations, and video reporting for NRIs abroad.' },
  { icon: 'document-text-outline',  title: 'Legal & Documentation',  desc: 'Power of attorney, land records, mutation, and property registration support.' },
  { icon: 'people-outline',         title: 'Family Check-ins',       desc: 'Trusted local team visits family members, provides updates, and assists during emergencies.' },
  { icon: 'business-outline',       title: 'Investment Advisory',    desc: 'Kerala real estate market insights, legal checks, and NRI-friendly investment guidance.' },
  { icon: 'car-outline',            title: 'Chauffeur Services',     desc: 'Long-term chauffeur hire for parents. Airport pickups, hospital runs, daily errands.' },
  { icon: 'shield-checkmark-outline', title: 'Trust & Oversight',   desc: 'Ongoing monitoring of properties. Maintenance, bill payments, and tenant management.' },
];

export default function NRIService() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF8' }}>
      <View style={{ backgroundColor: '#8B5CF6', paddingTop: 56, paddingBottom: 36, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <View style={{ width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Ionicons name="airplane" size={28} color="#FFFFFF" />
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
          For Keralites Abroad
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800', lineHeight: 34, marginBottom: 12 }}>
          NRI Concierge{'\n'}Service
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 21 }}>
          Stay connected to Kerala from anywhere in the world. We're your eyes, ears, and hands on the ground.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#8B5CF6', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, marginTop: 8 }}>
          Our NRI Services
        </Text>
        {SERVICES.map((f, i) => (
          <Card key={i} style={{ marginBottom: 12, flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
            <View style={{ width: 42, height: 42, backgroundColor: '#F5F3FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={f.icon as any} size={20} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0D3B5C', marginBottom: 4 }}>{f.title}</Text>
              <Text style={{ fontSize: 13, color: '#64748B', lineHeight: 19 }}>{f.desc}</Text>
            </View>
          </Card>
        ))}

        <View style={{ backgroundColor: '#8B5CF6', borderRadius: 20, padding: 24, marginTop: 12, alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            Get Started
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 20, lineHeight: 26 }}>
            Kerala is in good hands{'\n'}with Shahr.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(intake)/step1')}
            style={{ backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 15, paddingHorizontal: 32 }}
          >
            <Text style={{ color: '#8B5CF6', fontSize: 16, fontWeight: '800' }}>Start NRI Request →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
