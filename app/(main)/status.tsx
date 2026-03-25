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

const STATUS_STEPS = [
  { id: '1', label: 'Request Received', time: '10:00 AM', completed: true },
  { id: '2', label: 'Driver Assigned', time: '10:05 AM', completed: true },
  { id: '3', label: 'Driver En Route', time: '10:15 AM', completed: true, current: true },
  { id: '4', label: 'Pickup', time: '10:30 AM', completed: false },
  { id: '5', label: 'Destination', time: '02:30 PM', completed: false },
];

export default function StatusScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.textLight} />
          </TouchableOpacity>
          <ThemedText variant="section" color="light">
            Trip Status
          </ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Trip Card */}
          <View style={styles.tripCard}>
            <View style={styles.routeRow}>
              <ThemedText variant="cardTitle" color="primary">
                Kochi Airport
              </ThemedText>
              <Ionicons name="arrow-forward" size={16} color={Colors.textMuted} />
              <ThemedText variant="cardTitle" color="primary">
                Munnar
              </ThemedText>
            </View>
            <View style={styles.tripDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
                <ThemedText variant="small" color="muted">
                  Mar 28, 2024
                </ThemedText>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="car-outline" size={14} color={Colors.textMuted} />
                <ThemedText variant="small" color="muted">
                  Sedan • KL 01 AB 1234
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Driver Card */}
          <View style={styles.driverCard}>
            <View style={styles.driverAvatar}>
              <Ionicons name="person" size={24} color={Colors.textLight} />
            </View>
            <View style={styles.driverInfo}>
              <ThemedText variant="cardTitle" color="primary">
                Rajesh Kumar
              </ThemedText>
              <ThemedText variant="small" color="muted">
                4.9 ★ • 2,450 trips
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.callButton}>
              <Ionicons name="call" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Status Timeline */}
          <ThemedText variant="cardTitle" color="light" style={styles.timelineTitle}>
            Trip Progress
          </ThemedText>

          <View style={styles.timeline}>
            {STATUS_STEPS.map((step, index) => (
              <View key={step.id} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[
                    styles.timelineDot,
                    step.completed && styles.timelineDotCompleted,
                    step.current && styles.timelineDotCurrent,
                  ]}>
                    {step.completed && (
                      <Ionicons name="checkmark" size={12} color={Colors.textPrimary} />
                    )}
                  </View>
                  {index < STATUS_STEPS.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      step.completed && styles.timelineLineCompleted,
                    ]} />
                  )}
                </View>
                <View style={styles.timelineRight}>
                  <ThemedText
                    variant="body"
                    color={step.completed || step.current ? 'primary' : 'muted'}
                  >
                    {step.label}
                  </ThemedText>
                  <ThemedText variant="small" color="muted">
                    {step.time}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>

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
  },
  tripCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLarge,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.cardGap,
    ...Shadows.card,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tripDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLarge,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.sectionGap,
    ...Shadows.card,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInfo: {
    flex: 1,
    marginLeft: 16,
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineTitle: {
    marginBottom: 20,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.cardDark,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timelineDotCurrent: {
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.cardDark,
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: Colors.primary,
  },
  timelineRight: {
    paddingTop: 2,
  },
  bottomPadding: {
    height: 100,
  },
});
