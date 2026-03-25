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

const MENU_ITEMS = [
  { id: 'trips', label: 'My Trips', icon: 'briefcase-outline', route: '/(main)/bookings' },
  { id: 'saved', label: 'Saved Places', icon: 'heart-outline', route: '/(main)/explore' },
  { id: 'payments', label: 'Payment Methods', icon: 'card-outline', route: null },
  { id: 'settings', label: 'Settings', icon: 'settings-outline', route: null },
  { id: 'help', label: 'Help & Support', icon: 'help-circle-outline', route: '/(main)/chat' },
  { id: 'logout', label: 'Logout', icon: 'log-out-outline', route: null },
];

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="title" color="light">
            Profile
          </ThemedText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={Colors.textLight} />
            </View>
            <View style={styles.profileInfo}>
              <ThemedText variant="section" color="primary">
                Guest User
              </ThemedText>
              <ThemedText variant="small" color="muted">
                guest@example.com
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText variant="title" color="light">
                3
              </ThemedText>
              <ThemedText variant="small" color="lightMuted">
                Trips
              </ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText variant="title" color="light">
                2
              </ThemedText>
              <ThemedText variant="small" color="lightMuted">
                Saved
              </ThemedText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ThemedText variant="title" color="light">
                5
              </ThemedText>
              <ThemedText variant="small" color="lightMuted">
                Bookings
              </ThemedText>
            </View>
          </View>

          {/* Menu */}
          <View style={styles.menuContainer}>
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index === MENU_ITEMS.length - 1 && styles.menuItemLast,
                ]}
                onPress={() => item.route && router.push(item.route as any)}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.menuIcon}>
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={item.id === 'logout' ? Colors.error : Colors.textLightMuted}
                    />
                  </View>
                  <ThemedText
                    variant="body"
                    color={item.id === 'logout' ? 'secondary' : 'primary'}
                  >
                    {item.label}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
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
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 12,
    paddingBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLarge,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.cardGap,
    ...Shadows.card,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: Spacing.radiusFull,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cardDark,
    borderRadius: Spacing.radiusLarge,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.sectionGap,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.divider,
  },
  menuContainer: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLarge,
    overflow: 'hidden',
    ...Shadows.card,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.cardPadding,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: Spacing.radiusMedium,
    backgroundColor: Colors.cardSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPadding: {
    height: 100,
  },
});
