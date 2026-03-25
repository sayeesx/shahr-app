import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Shadows } from '../../lib/theme';
import { ThemedText } from '../../components/ui/ThemedText';
import { FloatingNav } from '../../components/ui/FloatingNav';

const CAB_TYPES = [
  {
    id: 'sedan',
    name: 'Sedan',
    capacity: 4,
    price: '₹12/km',
    base: '₹200',
    icon: 'car-outline',
  },
  {
    id: 'suv',
    name: 'SUV',
    capacity: 6,
    price: '₹18/km',
    base: '₹350',
    icon: 'car-sport-outline',
  },
  {
    id: 'luxury',
    name: 'Luxury',
    capacity: 4,
    price: '₹30/km',
    base: '₹500',
    icon: 'diamond-outline',
  },
];

export default function BookCabScreen() {
  const [selectedCab, setSelectedCab] = useState('sedan');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.textLight} />
          </TouchableOpacity>
          <ThemedText variant="section" color="light">
            Book a Cab
          </ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Route Summary */}
          <View style={styles.routeCard}>
            <View style={styles.routeRow}>
              <View style={styles.routeDot} />
              <ThemedText variant="body" color="primary">
                Kochi Airport
              </ThemedText>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <Ionicons name="location" size={16} color={Colors.primary} />
              <ThemedText variant="body" color="primary">
                Munnar
              </ThemedText>
            </View>
          </View>

          {/* Cab Types */}
          <ThemedText variant="cardTitle" color="light" style={styles.sectionTitle}>
            Select Cab Type
          </ThemedText>

          {CAB_TYPES.map((cab) => (
            <TouchableOpacity
              key={cab.id}
              onPress={() => setSelectedCab(cab.id)}
              style={[
                styles.cabCard,
                selectedCab === cab.id && styles.cabCardActive,
              ]}
            >
              <View style={styles.cabLeft}>
                <View style={[
                  styles.cabIcon,
                  selectedCab === cab.id && styles.cabIconActive,
                ]}>
                  <Ionicons
                    name={cab.icon as any}
                    size={24}
                    color={selectedCab === cab.id ? Colors.textPrimary : Colors.textLightMuted}
                  />
                </View>
                <View>
                  <ThemedText variant="cardTitle" color="primary">
                    {cab.name}
                  </ThemedText>
                  <ThemedText variant="small" color="muted">
                    {cab.capacity} seats • {cab.price}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.cabRight}>
                <ThemedText variant="section" color="primary">
                  {cab.base}
                </ThemedText>
                <ThemedText variant="caption" color="muted">
                  base fare
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity style={styles.ctaButton}>
            <ThemedText variant="cardTitle" color="primary">
              Continue
            </ThemedText>
            <Ionicons name="arrow-forward" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <FloatingNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 20,
  },
  routeCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLarge,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.sectionGap,
    ...Shadows.card,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.primary,
  },
  routeLine: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginLeft: 4.5,
    marginVertical: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  cabCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLarge,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.cardGap,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.card,
  },
  cabCardActive: {
    borderColor: Colors.primary,
  },
  cabLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cabIcon: {
    width: 48,
    height: 48,
    borderRadius: Spacing.radiusMedium,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cabIconActive: {
    backgroundColor: Colors.primary,
  },
  cabRight: {
    alignItems: 'flex-end',
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.screenPadding,
    right: Spacing.screenPadding,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Spacing.radiusXL,
    paddingVertical: 16,
    ...Shadows.button,
  },
  bottomPadding: {
    height: 120,
  },
});
