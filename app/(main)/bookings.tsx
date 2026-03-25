import React from 'react';
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

const BOOKINGS = [
  {
    id: '1',
    type: 'cab',
    title: 'Kochi to Munnar',
    date: 'Mar 28, 2024',
    time: '08:00 AM',
    status: 'confirmed',
    price: '₹2,500',
    icon: 'car',
  },
  {
    id: '2',
    type: 'package',
    title: 'Kerala Backwaters',
    date: 'Apr 15, 2024',
    time: '09:30 AM',
    status: 'pending',
    price: '₹8,500',
    icon: 'boat',
  },
  {
    id: '3',
    type: 'cab',
    title: 'Airport Transfer',
    date: 'Mar 25, 2024',
    time: '05:00 PM',
    status: 'completed',
    price: '₹1,200',
    icon: 'airplane',
  },
];

const STATUS_COLORS: Record<string, string> = {
  confirmed: Colors.primary,
  pending: '#FFC107',
  completed: Colors.textMuted,
};

export default function BookingsScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="title" color="light">
            My Bookings
          </ThemedText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {BOOKINGS.map((booking) => (
            <TouchableOpacity key={booking.id} style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: STATUS_COLORS[booking.status] + '20' }]}>
                  <Ionicons
                    name={booking.icon as any}
                    size={20}
                    color={STATUS_COLORS[booking.status]}
                  />
                </View>
                <View style={styles.statusBadge}>
                  <ThemedText variant="caption" color="muted">
                    {booking.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>

              <ThemedText variant="cardTitle" color="primary" style={styles.bookingTitle}>
                {booking.title}
              </ThemedText>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
                  <ThemedText variant="small" color="muted">
                    {booking.date}
                  </ThemedText>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                  <ThemedText variant="small" color="muted">
                    {booking.time}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.priceRow}>
                <ThemedText variant="section" color="primary">
                  {booking.price}
                </ThemedText>
                <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
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
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 12,
    paddingBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.cardGap,
  },
  bookingCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLarge,
    padding: Spacing.cardPadding,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Spacing.radiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.cardSecondary,
    borderRadius: Spacing.radiusSmall,
  },
  bookingTitle: {
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bottomPadding: {
    height: 100,
  },
});
