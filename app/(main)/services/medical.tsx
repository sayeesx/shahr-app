import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

const FEATURES = [
  { icon: 'business-outline',       title: 'Hospital Coordination',     desc: 'NABH-accredited hospitals. Direct admission support, room booking, and pre-arrival planning.' },
  { icon: 'person-outline',         title: 'Doctor Appointment',        desc: 'Specialist consultations arranged in advance. Second opinions from top Kerala surgeons.' },
  { icon: 'home-outline',           title: 'Recovery Stay',             desc: 'Wellness retreats and service apartments near hospitals for post-procedure recovery.' },
  { icon: 'car-outline',            title: 'Airport & Hospital Transfer',desc: 'Verified medical-grade vehicles. Stretcher support and wheelchair access available.' },
  { icon: 'document-text-outline',  title: 'Documentation Help',        desc: 'Visa assistance, medical report translation, and insurance coordination.' },
  { icon: 'call-outline',           title: '24/7 Concierge Support',    desc: 'A dedicated coordinator reachable anytime during your medical journey.' },
];

export default function MedicalService() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF8' }}>
      {/* Hero */}
      <View style={{ backgroundColor: '#0D3B5C', paddingTop: 56, paddingBottom: 36, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <View style={{ width: 56, height: 56, backgroundColor: 'rgba(236,201,75,0.15)', borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Ionicons name="medkit" size={28} color="#ECC94B" />
        </View>
        <Text style={{ color: '#ECC94B', fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
          Healthcare in Kerala
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800', lineHeight: 34, marginBottom: 12 }}>
          Medical Concierge{'\n'}Service
        </Text>
        <Text style={{ color: '#94B8D0', fontSize: 14, lineHeight: 21 }}>
          World-class healthcare at a fraction of global costs. We coordinate your entire medical journey — from arrival to recovery.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#2ba89a', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, marginTop: 8 }}>
          What We Handle
        </Text>
        {FEATURES.map((f, i) => (
          <Card key={i} style={{ marginBottom: 12, flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
            <View style={{ width: 42, height: 42, backgroundColor: '#EEF7FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={f.icon as any} size={20} color="#0D3B5C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0D3B5C', marginBottom: 4 }}>{f.title}</Text>
              <Text style={{ fontSize: 13, color: '#64748B', lineHeight: 19 }}>{f.desc}</Text>
            </View>
          </Card>
        ))}

        <View style={{ backgroundColor: '#0D3B5C', borderRadius: 20, padding: 24, marginTop: 12, alignItems: 'center' }}>
          <Text style={{ color: '#ECC94B', fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>Ready to begin?</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 20, lineHeight: 26 }}>
            Start your medical journey{'\n'}with Shahr today.
          </Text>
          <Button title="Plan My Medical Visit →" variant="gold" onPress={() => router.push('/(intake)/step1')} />
        </View>
      </ScrollView>
    </View>
  );
}
