import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Shadows } from '../../lib/theme';
import { ThemedText } from '../../components/ui/ThemedText';
import { FloatingNav } from '../../components/ui/FloatingNav';

const DATE_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'weekend', label: 'Weekend' },
  { id: 'next', label: 'Next Week' },
];

export default function PlanScreen() {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('today');
  const [aiEnabled, setAiEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.textLight} />
          </TouchableOpacity>
          <ThemedText variant="section" color="light">
            Plan Your Trip
          </ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Route Card */}
          <View style={styles.routeCard}>
            {/* From Field */}
            <View style={styles.inputRow}>
              <View style={styles.inputIcon}>
                <View style={styles.dot} />
              </View>
              <View style={styles.inputContainer}>
                <ThemedText variant="caption" color="muted">
                  FROM
                </ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Current Location"
                  placeholderTextColor={Colors.textMuted}
                  value={fromLocation}
                  onChangeText={setFromLocation}
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* To Field */}
            <View style={styles.inputRow}>
              <View style={styles.inputIcon}>
                <Ionicons name="location" size={16} color={Colors.primary} />
              </View>
              <View style={styles.inputContainer}>
                <ThemedText variant="caption" color="muted">
                  TO
                </ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Destination in Kerala"
                  placeholderTextColor={Colors.textMuted}
                  value={toLocation}
                  onChangeText={setToLocation}
                />
              </View>
            </View>
          </View>

          {/* Swap Button */}
          <TouchableOpacity style={styles.swapButton}>
            <Ionicons name="swap-vertical" size={20} color={Colors.textLight} />
          </TouchableOpacity>

          {/* Date Selection */}
          <View style={styles.section}>
            <ThemedText variant="cardTitle" color="light" style={styles.sectionTitle}>
              When?
            </ThemedText>
            <View style={styles.dateContainer}>
              {DATE_OPTIONS.map((date) => (
                <TouchableOpacity
                  key={date.id}
                  onPress={() => setSelectedDate(date.id)}
                  style={[
                    styles.datePill,
                    selectedDate === date.id && styles.datePillActive,
                  ]}
                >
                  <ThemedText
                    variant="small"
                    color={selectedDate === date.id ? 'primary' : 'lightMuted'}
                  >
                    {date.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* AI Toggle */}
          <View style={styles.aiContainer}>
            <View style={styles.aiLeft}>
              <View style={styles.aiIcon}>
                <Ionicons name="sparkles" size={18} color={Colors.primary} />
              </View>
              <View>
                <ThemedText variant="cardTitle" color="light">
                  AI Suggestions
                </ThemedText>
                <ThemedText variant="small" color="lightMuted">
                  Get personalized recommendations
                </ThemedText>
              </View>
            </View>
            <Switch
              value={aiEnabled}
              onValueChange={setAiEnabled}
              trackColor={{ false: Colors.cardDark, true: Colors.primary }}
              thumbColor={Colors.textLight}
            />
          </View>

          {/* Bottom padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* CTA Button */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/(main)/results' as any)}
            activeOpacity={0.9}
          >
            <ThemedText variant="cardTitle" color="primary">
              Generate Plan
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

  // Route Card
  routeCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLarge,
    padding: Spacing.cardPadding,
    ...Shadows.card,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.primary,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
    padding: 0,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 48,
    marginVertical: 4,
  },

  // Swap Button
  swapButton: {
    position: 'absolute',
    right: 32,
    top: 140,
    width: 44,
    height: 44,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.button,
    zIndex: 10,
  },

  // Section
  section: {
    marginTop: Spacing.sectionGap,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  datePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Spacing.radiusXL,
    backgroundColor: Colors.cardDark,
  },
  datePillActive: {
    backgroundColor: Colors.primary,
  },

  // AI Toggle
  aiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardDark,
    borderRadius: Spacing.radiusLarge,
    padding: Spacing.cardPadding,
    marginTop: Spacing.sectionGap,
  },
  aiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiIcon: {
    width: 44,
    height: 44,
    borderRadius: Spacing.radiusMedium,
    backgroundColor: Colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // CTA
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
