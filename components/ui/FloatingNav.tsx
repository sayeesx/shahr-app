import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Shadows } from '../../lib/theme';
import { router, usePathname } from 'expo-router';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; icon: IoniconsName; activeIcon: IoniconsName; route: any }[] = [
  { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: '/(main)/new' },
  { name: 'Explore', icon: 'compass-outline', activeIcon: 'compass', route: '/(main)/explore' },
  { name: 'Bookings', icon: 'calendar-outline', activeIcon: 'calendar', route: '/(main)/bookings' },
  { name: 'Chat', icon: 'chatbubble-outline', activeIcon: 'chatbubble', route: '/(main)/chat' },
  { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: '/(main)/profile' },
];

export function FloatingNav() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <View style={styles.navWrapper}>
        {TABS.map((tab, index) => {
          const isActive = pathname === tab.route ||
            (tab.route === '/(main)/new' && (pathname === '/(main)' || pathname === '/(main)/'));

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => router.push(tab.route)}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              <View style={[
                styles.iconContainer,
                isActive && styles.activeIconContainer,
              ]}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={22}
                  color={isActive ? Colors.textPrimary : Colors.textLightMuted}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: Spacing.screenPadding,
    right: Spacing.screenPadding,
  },
  navWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 8,
    ...Shadows.float,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Spacing.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    backgroundColor: Colors.primary,
  },
  inactiveIcon: {
    color: Colors.textMuted,
  },
});
