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

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'grid-outline' },
  { id: 'beaches', label: 'Beaches', icon: 'sunny-outline' },
  { id: 'hills', label: 'Hills', icon: 'triangle-outline' },
  { id: 'heritage', label: 'Heritage', icon: 'business-outline' },
];

const DESTINATIONS = [
  {
    id: '1',
    name: 'Kovalam Beach',
    location: 'Thiruvananthapuram',
    rating: 4.8,
    reviews: 2340,
    image: 'https://images.unsplash.com/photo-1589979481223-deb893043163?w=400&h=500&fit=crop',
  },
  {
    id: '2',
    name: 'Athirappilly Falls',
    location: 'Thrissur',
    rating: 4.9,
    reviews: 1856,
    image: 'https://images.unsplash.com/photo-1564996525432-89b7d0df9e6e?w=400&h=500&fit=crop',
  },
  {
    id: '3',
    name: 'Varkala Cliff',
    location: 'Thiruvananthapuram',
    rating: 4.7,
    reviews: 1623,
    image: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?w=400&h=500&fit=crop',
  },
];

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText variant="caption" color="lightMuted">
              DISCOVER
            </ThemedText>
            <ThemedText variant="title" color="light">
              Explore Kerala
            </ThemedText>
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive,
              ]}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={selectedCategory === cat.id ? Colors.textPrimary : Colors.textLightMuted}
                style={styles.categoryIcon}
              />
              <ThemedText
                variant="small"
                color={selectedCategory === cat.id ? 'primary' : 'lightMuted'}
              >
                {cat.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Destinations */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.destinationsContainer}
        >
          {DESTINATIONS.map((dest) => (
            <TouchableOpacity key={dest.id} style={styles.destinationCard}>
              <Image source={{ uri: dest.image }} style={styles.destinationImage} />
              <View style={styles.destinationOverlay}>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color={Colors.primary} />
                  <ThemedText variant="small" color="light">
                    {dest.rating}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.destinationInfo}>
                <ThemedText variant="cardTitle" color="primary">
                  {dest.name}
                </ThemedText>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color={Colors.textMuted} />
                  <ThemedText variant="small" color="muted">
                    {dest.location}
                  </ThemedText>
                </View>
                <ThemedText variant="caption" color="muted">
                  {dest.reviews.toLocaleString()} reviews
                </ThemedText>
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
  categoryContainer: {
    paddingHorizontal: Spacing.screenPadding,
    gap: 10,
    paddingBottom: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Spacing.radiusXL,
    backgroundColor: Colors.cardDark,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryIcon: {
    marginRight: 6,
  },
  destinationsContainer: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.cardGap,
  },
  destinationCard: {
    backgroundColor: Colors.card,
    borderRadius: Spacing.radiusLarge,
    overflow: 'hidden',
    ...Shadows.card,
  },
  destinationImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  destinationOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Spacing.radiusSmall,
  },
  destinationInfo: {
    padding: Spacing.cardPadding,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginBottom: 8,
  },
  bottomPadding: {
    height: 100,
  },
});
