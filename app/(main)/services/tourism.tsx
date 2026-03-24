import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

const EXPERIENCES = [
  { icon: 'boat-outline',        title: 'Backwater Cruises',        desc: 'Houseboat stays in Alleppey. Day cruises through Vembanad and Punnamada lakes.' },
  { icon: 'leaf-outline',        title: 'Ayurveda & Wellness',      desc: 'Authentic Panchakarma treatments, rejuvenation retreats in Wayanad and Kovalam.' },
  { icon: 'paw-outline',         title: 'Wildlife & Nature',        desc: 'Periyar Tiger Reserve. Elephant camps, Munnar tea gardens, Athirapally falls.' },
  { icon: 'restaurant-outline',  title: 'Culinary Experiences',     desc: 'Kerala Sadhya, seafood trails in Fort Kochi, spice plantation visits in Thekkady.' },
  { icon: 'camera-outline',      title: 'Cultural Immersion',       desc: 'Kathakali performances, Kalaripayattu, temple festivals, old Kochi heritage walks.' },
  { icon: 'car-outline',         title: 'Verified Drivers',         desc: 'Licensed, English-speaking drivers with curated multi-day itinerary support.' },
];

export default function TourismService() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF8' }}>
      <View style={{ backgroundColor: '#2ba89a', paddingTop: 56, paddingBottom: 36, paddingHorizontal: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
          <Ionicons name="arrow-back" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <View style={{ width: 56, height: 56, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Ionicons name="partly-sunny" size={28} color="#FFFFFF" />
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
          God's Own Country
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800', lineHeight: 34, marginBottom: 12 }}>
          Tourism Planning{'\n'}Service
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 21 }}>
          Curated Kerala experiences designed around your interests, budget, and travel style.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#2ba89a', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16, marginTop: 8 }}>
          Curated Experiences
        </Text>
        {EXPERIENCES.map((f, i) => (
          <Card key={i} style={{ marginBottom: 12, flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
            <View style={{ width: 42, height: 42, backgroundColor: '#F0F9F8', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={f.icon as any} size={20} color="#2ba89a" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0D3B5C', marginBottom: 4 }}>{f.title}</Text>
              <Text style={{ fontSize: 13, color: '#64748B', lineHeight: 19 }}>{f.desc}</Text>
            </View>
          </Card>
        ))}

        <View style={{ backgroundColor: '#2ba89a', borderRadius: 20, padding: 24, marginTop: 12, alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            Start Planning
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 20, lineHeight: 26 }}>
            Your perfect Kerala trip{'\n'}is one tap away.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(intake)/step1')}
            style={{ backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 15, paddingHorizontal: 32 }}
          >
            <Text style={{ color: '#2ba89a', fontSize: 16, fontWeight: '800' }}>Plan My Trip →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
