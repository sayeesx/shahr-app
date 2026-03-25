import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Shadows } from '../../lib/theme';
import { ThemedText } from '../../components/ui/ThemedText';
import { FloatingNav } from '../../components/ui/FloatingNav';

const PACKAGES = [
  {
    id: '1',
    name: 'Munnar Getaway',
    duration: '3 Days / 2 Nights',
    price: '₹12,500',
    highlights: ['Tea Gardens', 'Eravikulam NP', 'Sunrise View'],
    image: 'https://images.unsplash.com/photo-1595655223882-4f0366640dc4?w=400&h=250&fit=crop',
  },
  {
    id: '2',
    name: 'Backwaters Bliss',
    duration: '2 Days / 1 Night',
    price: '₹8,900',
    highlights: ['Houseboat Stay', 'Village Tour', 'Sunset Cruise'],
    image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=400&h=250&fit=crop',
  },
  {
    id: '3',
    name: 'Complete Kerala',
    duration: '7 Days / 6 Nights',
    price: '₹35,000',
    highlights: ['Munnar', 'Alleppey', 'Kochi', 'Thekkady'],
    image: 'https://images.unsplash.com/photo-1581797289196-52e5b07bd6bc?w=400&h=250&fit=crop',
  },
];

export default function PackagesScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.textLight} />
          </TouchableOpacity>
          <ThemedText variant="section" color="light">
            Travel Packages
          </ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {PACKAGES.map((pkg) => (
            <TouchableOpacity key={pkg.id} style={styles.packageCard}>
              <Image source={{ uri: pkg.image }} style={styles.packageImage} />
              <View style={styles.packageContent}>
                <View style={styles.packageHeader}>
                  <ThemedText variant="cardTitle" color="primary">
                    {pkg.name}
                  </ThemedText>
                  <View style={styles.durationBadge}>
                    <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
                    <ThemedText variant="caption" color="muted">
                      {pkg.duration}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.highlightsRow}>
                  {pkg.highlights.map((highlight, idx) => (
                    <View key={idx} style={styles.highlightChip}>
                      <ThemedText variant="caption" color="muted">
                        {highlight}
                      </ThemedText>
                    </View>
                  ))}
                </View>

                <View style={styles.priceRow}>
                  <View>
                    <ThemedText variant="section" color="primary">
                      {pkg.price}
                    </ThemedText>
                    <ThemedText variant="small" color="muted">
                      per person
                    </ThemedText>
                  </View>
                  <TouchableOpacity style={styles.bookButton}>
                    <ThemedText variant="small" color="primary">
                      Book Now
                    </ThemedText>
                    <Ionicons name="arrow-forward" size={16} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.bottomPadding} />
        </ScrollView>
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
    gap: Spacing.cardGap,
  },
  packageCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLarge,
    overflow: 'hidden',
    ...Shadows.card,
  },
  packageImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  packageContent: {
    padding: Spacing.cardPadding,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.cardSecondary,
    borderRadius: Spacing.radiusSmall,
  },
  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  highlightChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.cardSecondary,
    borderRadius: Spacing.radiusSmall,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Spacing.radiusXL,
  },
  bottomPadding: {
    height: 100,
  },
});
