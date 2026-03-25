import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Shadows } from '../../lib/theme';
import { ThemedText } from '../../components/ui/ThemedText';
import { FloatingNav } from '../../components/ui/FloatingNav';
import { PressableScale } from '../../components/ui/PressableScale';
import { useAppStore } from '../../store/useAppStore';
import { signOut } from '../../lib/supabase';

const MENU_ITEMS = [
  { id: 'trips', label: 'My Trips', icon: 'briefcase-outline', color: Colors.primary, route: '/(main)/bookings' },
  { id: 'saved', label: 'Saved Places', icon: 'heart-outline', color: '#FF6B6B', route: '/(main)/explore' },
  { id: 'payments', label: 'Payment Methods', icon: 'card-outline', color: '#4ECDC4', route: null },
  { id: 'settings', label: 'Settings', icon: 'settings-outline', color: '#95A5A6', route: null },
  { id: 'help', label: 'Help & Support', icon: 'help-circle-outline', color: '#3498DB', route: '/(main)/chat' },
];

export default function ProfileScreen() {
  const clearSession = useAppStore((s) => s.clearSession);
  const session = useAppStore((s) => s.session);

  const handleLogout = async () => {
    try {
      await signOut();
      clearSession();
      router.replace('/(auth)' as any);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleMenuPress = (item: typeof MENU_ITEMS[0]) => {
    if (item.route) {
      router.push(item.route as any);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="title" color="primary">
            Profile
          </ThemedText>
          <TouchableOpacity style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={36} color={Colors.textLight} />
              </View>
              <TouchableOpacity style={styles.editAvatarBtn}>
                <Ionicons name="camera" size={14} color={Colors.textLight} />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <ThemedText variant="section" color="primary">
                {session?.user?.user_metadata?.name || 'Vijay'}
              </ThemedText>
              <ThemedText variant="body" color="secondary">
                {session?.user?.email || 'vijay@example.com'}
              </ThemedText>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <PressableScale>
              <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="airplane" size={24} color={Colors.primaryDark} />
                <ThemedText variant="title" color="primary" style={styles.statNumber}>12</ThemedText>
                <ThemedText variant="small" color="secondary">Trips</ThemedText>
              </View>
            </PressableScale>
            <PressableScale>
              <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="heart" size={24} color="#FF9800" />
                <ThemedText variant="title" color="primary" style={styles.statNumber}>8</ThemedText>
                <ThemedText variant="small" color="secondary">Saved</ThemedText>
              </View>
            </PressableScale>
            <PressableScale>
              <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="star" size={24} color="#2196F3" />
                <ThemedText variant="title" color="primary" style={styles.statNumber}>4.9</ThemedText>
                <ThemedText variant="small" color="secondary">Rating</ThemedText>
              </View>
            </PressableScale>
          </View>

          {/* Menu Section */}
          <View style={styles.menuSection}>
            <ThemedText variant="section" color="primary" style={styles.menuTitle}>
              Quick Actions
            </ThemedText>
            <View style={styles.menuGrid}>
              {MENU_ITEMS.map((item) => (
                <PressableScale key={item.id} onPress={() => handleMenuPress(item)}>
                  <View style={styles.menuItem}>
                    <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                      <Ionicons name={item.icon as any} size={22} color={item.color} />
                    </View>
                    <ThemedText variant="body" color="primary" style={styles.menuLabel}>
                      {item.label}
                    </ThemedText>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                  </View>
                </PressableScale>
              ))}
            </View>
          </View>

          {/* Logout Button */}
          <PressableScale onPress={handleLogout}>
            <View style={styles.logoutButton}>
              <View style={[styles.menuIcon, { backgroundColor: `${Colors.error}20` }]}>
                <Ionicons name="log-out-outline" size={22} color={Colors.error} />
              </View>
              <ThemedText variant="body" color="secondary" style={styles.logoutText}>
                Logout
              </ThemedText>
              <Ionicons name="chevron-forward" size={18} color={Colors.error} />
            </View>
          </PressableScale>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: 12,
    paddingBottom: 20,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 20,
  },
  statNumber: {
    marginTop: 8,
    marginBottom: 4,
  },
  menuSection: {
    marginBottom: 24,
  },
  menuTitle: {
    marginBottom: 16,
  },
  menuGrid: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
  },
  logoutText: {
    flex: 1,
    marginLeft: 12,
    color: Colors.error,
  },
  bottomPadding: {
    height: 100,
  },
});
