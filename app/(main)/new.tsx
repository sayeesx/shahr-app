import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Shadows } from '../../lib/theme';
import { ThemedText } from '../../components/ui/ThemedText';
import { FloatingNav } from '../../components/ui/FloatingNav';
import { AnimatedNotificationBell } from '../../components/ui/AnimatedNotification';
import { PressableScale } from '../../components/ui/PressableScale';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40 - 12) / 2;

const ACTION_BUTTONS = [
  { id: '1', title: 'Book Your Tour', icon: 'bus-outline', variant: 'primary' as const },
  { id: '2', title: 'Medical Visit', icon: 'medical-outline', variant: 'secondary' as const },
  { id: '3', title: 'NRI Concierge', icon: 'people-outline', variant: 'secondary' as const },
  { id: '4', title: 'AI Trip Planner', icon: 'hardware-chip-outline', variant: 'secondary' as const },
];

const TRAVEL_PACKAGES = [
  {
    id: '1',
    title: 'Adrenaline Awaits',
    subtitle: 'Mountain Adventure',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400',
  },
  {
    id: '2',
    title: 'Sands of Serenity',
    subtitle: 'Beach Paradise',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
  },
  {
    id: '3',
    title: 'Kerala Backwaters',
    subtitle: 'Houseboat Stay',
    image: 'https://images.unsplash.com/photo-1602211844066-d3bb6e9b39ce?w=400',
  },
];

function ActionButton({
  title,
  icon,
  variant,
  onPress,
}: {
  title: string;
  icon: any;
  variant: 'primary' | 'secondary';
  onPress: () => void;
}) {
  const isPrimary = variant === 'primary';

  return (
    <PressableScale onPress={onPress}>
      <View
        style={[
          styles.actionButton,
          { backgroundColor: isPrimary ? Colors.primary : Colors.card },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isPrimary ? 'rgba(255,255,255,0.3)' : Colors.cardDark },
          ]}
        >
          <Ionicons
            name={icon}
            size={24}
            color={isPrimary ? Colors.textLight : Colors.textPrimary}
          />
        </View>
        <ThemedText
          variant="cardTitle"
          color={isPrimary ? 'light' : 'primary'}
          style={styles.actionText}
        >
          {title}
        </ThemedText>
      </View>
    </PressableScale>
  );
}

function TravelPackageCard({
  title,
  subtitle,
  image,
}: {
  title: string;
  subtitle: string;
  image: string;
}) {
  return (
    <PressableScale>
      <View style={styles.packageCard}>
        <Image source={{ uri: image }} style={styles.packageImage} />
        <View style={styles.packageContent}>
          <ThemedText variant="cardTitle" color="primary">
            {title}
          </ThemedText>
          <TouchableOpacity style={styles.arrowButton}>
            <Ionicons name="arrow-forward" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </PressableScale>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.contentWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <ThemedText variant="greeting" color="secondary">
                Good Morning, Vijay
              </ThemedText>
              <ThemedText variant="title" color="primary" style={styles.mainTitle}>
                Plan Your Journey
              </ThemedText>
            </View>
            <AnimatedNotificationBell onPress={() => {}} />
          </View>

          {/* Action Grid */}
          <View style={styles.actionGrid}>
            {ACTION_BUTTONS.map((button) => (
              <ActionButton
                key={button.id}
                title={button.title}
                icon={button.icon}
                variant={button.variant}
                onPress={() => {}}
              />
            ))}
          </View>

          {/* Travel Packages Section */}
          <View style={styles.sectionHeader}>
            <ThemedText variant="section" color="primary">
              Travel Packages
            </ThemedText>
            <TouchableOpacity>
              <ThemedText variant="body" color="secondary">
                See All
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.packagesScroll}
          >
            {TRAVEL_PACKAGES.map((pkg) => (
              <TravelPackageCard
                key={pkg.id}
                title={pkg.title}
                subtitle={pkg.subtitle}
                image={pkg.image}
              />
            ))}
          </ScrollView>

          {/* Bottom padding for nav */}
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
  scrollContent: {
    paddingTop: 20,
  },
  contentWrapper: {
    paddingHorizontal: Spacing.screenPadding,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  headerLeft: {
    flex: 1,
  },
  mainTitle: {
    marginTop: 4,
  },

  // Action Grid
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    width: CARD_WIDTH,
    borderRadius: 20,
    padding: 16,
    ...Shadows.card,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionText: {
    lineHeight: 22,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  // Travel Packages
  packagesScroll: {
    gap: 12,
    paddingBottom: 4,
  },
  packageCard: {
    width: 200,
    backgroundColor: Colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    ...Shadows.card,
  },
  packageImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  packageContent: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom
  bottomPadding: {
    height: 100,
  },
});
