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

const FILTERS = [
  { id: 'low', label: 'Low to High' },
  { id: 'high', label: 'High to Low' },
  { id: 'fastest', label: 'Fastest' },
];

const RESULTS = [
  {
    id: '1',
    route: 'Kochi → Munnar',
    type: 'Cab',
    time: '08:00 AM',
    duration: '4h 30m',
    price: '₹2,500',
    seats: 4,
  },
  {
    id: '2',
    route: 'Kochi → Munnar',
    type: 'Package',
    time: '09:00 AM',
    duration: 'Full Day',
    price: '₹4,800',
    seats: null,
  },
  {
    id: '3',
    route: 'Kochi → Munnar',
    type: 'Luxury Cab',
    time: '10:00 AM',
    duration: '4h 15m',
    price: '₹4,200',
    seats: 6,
  },
  {
    id: '4',
    route: 'Kochi → Munnar',
    type: 'Shared',
    time: '11:00 AM',
    duration: '5h 00m',
    price: '₹1,200',
    seats: 1,
  },
];

export default function ResultsScreen() {
  const [selectedFilter, setSelectedFilter] = useState('low');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.textLight} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <ThemedText variant="section" color="light">
              Kochi → Munnar
            </ThemedText>
            <ThemedText variant="small" color="lightMuted">
              4 options available
            </ThemedText>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              onPress={() => setSelectedFilter(filter.id)}
              style={[
                styles.filterChip,
                selectedFilter === filter.id && styles.filterChipActive,
              ]}
            >
              <ThemedText
                variant="small"
                color={selectedFilter === filter.id ? 'primary' : 'lightMuted'}
              >
                {filter.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {RESULTS.map((item) => (
            <View key={item.id} style={styles.resultCard}>
              {/* Top Row */}
              <View style={styles.topRow}>
                <ThemedText variant="cardTitle" color="primary">
                  {item.route}
                </ThemedText>
                <View style={styles.typeBadge}>
                  <ThemedText variant="caption" color="muted">
                    {item.type}
                  </ThemedText>
                </View>
              </View>

              {/* Middle Row */}
              <View style={styles.middleRow}>
                <View style={styles.timeInfo}>
                  <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                  <ThemedText variant="small" color="muted">
                    {item.time}
                  </ThemedText>
                </View>
                <View style={styles.durationInfo}>
                  <Ionicons name="hourglass-outline" size={14} color={Colors.textMuted} />
                  <ThemedText variant="small" color="muted">
                    {item.duration}
                  </ThemedText>
                </View>
                {item.seats && (
                  <View style={styles.seatsInfo}>
                    <Ionicons name="people-outline" size={14} color={Colors.textMuted} />
                    <ThemedText variant="small" color="muted">
                      {item.seats} seats
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Bottom Row */}
              <View style={styles.bottomRow}>
                <ThemedText variant="section" color="primary">
                  {item.price}
                </ThemedText>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="arrow-forward" size={18} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Bottom padding */}
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
  headerCenter: {
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },

  // Filters
  filterContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Spacing.radiusXL,
    backgroundColor: Colors.cardDark,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },

  // Results
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.cardGap,
  },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLarge,
    padding: Spacing.cardPadding,
    ...Shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.cardSecondary,
    borderRadius: Spacing.radiusSmall,
  },
  middleRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seatsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomPadding: {
    height: 100,
  },
});
