import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AF } from '../../lib/authTheme';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';

// ── Types ───────────────────────────────────────────────────────────────────────

type Booking = {
  id: string;
  client_id: string;
  purpose: string;
  details: any;
  status: string;
  assigned_agent: string | null;
  created_at: string;
  updated_at: string;
};

// ── Categories ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'grid-outline' },
  { key: 'Cab Booking', label: 'Cabs', icon: 'car-outline' }, // Exact match from DB
  { key: 'flight', label: 'Flights', icon: 'airplane-outline' },
  { key: 'hospital', label: 'Hospital', icon: 'medical-outline' },
  { key: 'hotel', label: 'Hotels', icon: 'bed-outline' },
  { key: 'medical', label: 'Medical', icon: 'fitness-outline' },
  { key: 'pickup', label: 'Pickup', icon: 'navigate-outline' },
  { key: 'rental', label: 'Rentals', icon: 'key-outline' },
  { key: 'visa', label: 'Visa', icon: 'document-text-outline' },
  { key: 'tourism', label: 'Tours', icon: 'map-outline' },
  { key: 'concierge', label: 'Concierge', icon: 'headset-outline' },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
] as const;

// ── Helpers ─────────────────────────────────────────────────────────────────────

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'confirmed':
    case 'completed':
      return '#4CAF50';
    case 'pending':
      return '#FFC107';
    case 'cancelled':
    case 'rejected':
      return '#f44336';
    case 'in_progress':
      return '#2196F3';
    default:
      return '#305c5d';
  }
};

const getCategoryIcon = (purpose: string) => {
  const purposeLower = purpose?.toLowerCase() || '';
  const cat = CATEGORIES.find(c =>
    purposeLower === c.key.toLowerCase() ||
    purposeLower.includes(c.key.toLowerCase())
  );
  return cat?.icon || 'bookmark-outline';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  if (!amount) return '';
  return `₹${amount.toLocaleString('en-IN')}`;
};

// ── Components ─────────────────────────────────────────────────────────────────

const BookingCard = ({ item }: { item: Booking }) => {
  const purpose = item.purpose?.toLowerCase() || '';
  const isCab = purpose === 'cab booking';
  const isMedical = purpose.includes('medical');
  const isHotel = purpose.includes('hotel');
  const isFlight = purpose.includes('flight');
  const isVisa = purpose.includes('visa');
  const isRental = purpose.includes('rental');
  const isTourism = purpose.includes('tourism') || purpose.includes('tour');

  // Dynamic title based on booking type
  const getTitle = () => {
    if (isCab) return `${item.details?.vehicle_brand} ${item.details?.vehicle_model}`;
    if (isFlight) return `${item.details?.from} → ${item.details?.to}`;
    if (isHotel) return item.details?.hotel_name || 'Hotel Booking';
    if (isMedical) return `Medical: ${item.details?.country || 'Consultation'}`;
    if (isVisa) return `Visa: ${item.details?.country || 'Application'}`;
    if (isRental) return `${item.details?.brand} ${item.details?.model}`;
    if (isTourism) return item.details?.title || 'Tour Package';
    return item.details?.title || item.purpose;
  };

  // Dynamic subtitle based on booking type
  const getSubtitle = () => {
    if (isCab) return `${item.details?.pickup_address} → ${item.details?.drop_address}`;
    if (isFlight) return `${item.details?.airline} • ${item.details?.passengers} pax`;
    if (isHotel) return `${item.details?.location} • ${item.details?.nights} nights`;
    if (isMedical) return item.details?.conditionSummary || item.details?.treatment;
    if (isVisa) return item.details?.visa_type || 'Tourist Visa';
    if (isRental) return `${item.details?.pickup_location} • ${item.details?.duration}`;
    if (isTourism) return `${item.details?.country} • ${item.details?.interests}`;
    return item.details?.location || item.details?.description;
  };

  // Dynamic meta info
  const getMeta = () => {
    if (isCab) return formatCurrency(item.details?.total_fare);
    if (isFlight) return formatCurrency(item.details?.total_price);
    if (isHotel) return formatCurrency(item.details?.total_price);
    if (isMedical) return item.details?.budget || item.details?.duration;
    if (isVisa) return item.details?.processing_time || 'Standard';
    if (isRental) return formatCurrency(item.details?.total_price);
    if (isTourism) return item.details?.budget;
    return item.details?.budget || '';
  };

  const iconName = getCategoryIcon(item.purpose);

  return (
    <TouchableOpacity style={s.card} activeOpacity={0.9}>
      {/* Header */}
      <View style={s.cardHeader}>
        <View style={s.cardIconWrap}>
          <Ionicons name={iconName as any} size={20} color="#305c5d" />
        </View>
        <View style={s.cardHeaderText}>
          <Text style={[s.cardPurpose, { fontFamily: AF.medium }]}>{item.purpose}</Text>
          <Text style={[s.cardDateSmall, { fontFamily: AF.regular }]}>
            {formatDate(item.created_at)}
          </Text>
        </View>
        <View style={[s.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[s.badgeText, { color: getStatusColor(item.status), fontFamily: AF.semibold }]}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* Body */}
      <View style={s.cardBody}>
        <Text style={[s.cardTitle, { fontFamily: AF.bold }]} numberOfLines={1}>
          {getTitle()}
        </Text>
        {getSubtitle() && (
          <Text style={[s.cardSubtitle, { fontFamily: AF.medium }]} numberOfLines={2}>
            {getSubtitle()}
          </Text>
        )}
      </View>

      {/* Footer */}
      <View style={s.cardFooter}>
        <View style={s.cardMeta}>
          <Ionicons name="receipt-outline" size={14} color="#dabf7e" />
          <Text style={[s.cardId, { fontFamily: AF.medium }]}>
            {item.details?.booking_reference || item.id.slice(0, 8).toUpperCase()}
          </Text>
        </View>
        {getMeta() && (
          <Text style={[s.cardPrice, { fontFamily: AF.bold }]}>{getMeta()}</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={s.cardActions}>
        <TouchableOpacity style={s.actionBtn} activeOpacity={0.8}>
          <Ionicons name="eye-outline" size={16} color="#305c5d" />
          <Text style={[s.actionText, { fontFamily: AF.medium }]}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} activeOpacity={0.8}>
          <Ionicons name="chatbubble-outline" size={16} color="#305c5d" />
          <Text style={[s.actionText, { fontFamily: AF.medium }]}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} activeOpacity={0.8}>
          <Ionicons name="share-outline" size={16} color="#305c5d" />
          <Text style={[s.actionText, { fontFamily: AF.medium }]}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const EmptyState = ({ searchQuery, activeCategory }: { searchQuery: string; activeCategory: string }) => (
  <View style={s.empty}>
    <Ionicons
      name={searchQuery ? "search-outline" : "receipt-outline"}
      size={64}
      color="#dabf7e"
    />
    <Text style={[s.emptyTitle, { fontFamily: AF.semibold }]}>
      {searchQuery ? 'No results found' : activeCategory === 'all' ? 'No bookings yet' : `No ${activeCategory} bookings`}
    </Text>
    <Text style={[s.emptyText, { fontFamily: AF.regular }]}>
      {searchQuery
        ? `No bookings match "${searchQuery}"`
        : activeCategory === 'all'
          ? 'Your bookings will appear here once you make a reservation'
          : `You don't have any ${activeCategory} bookings yet`
      }
    </Text>
  </View>
);

// ── Main Component ──────────────────────────────────────────────────────────────

export default function BookingsScreen() {
  const session = useAppStore((s) => s.session);

  // State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching bookings for user:', session.user.id); // Debug log

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('client_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched bookings:', data?.length, data); // Debug log
      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.user?.id]);

  // Initial load
  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, [fetchBookings]);

  // FIXED: Category filter with proper case-insensitive matching
  const filteredBookings = useMemo(() => {
    let result = bookings;

    // Category filter - case insensitive
    if (activeCategory !== 'all') {
      result = result.filter(b => {
        const purpose = b.purpose?.toLowerCase() || '';
        const category = activeCategory.toLowerCase();

        // Exact match for "Cab Booking" (handles your specific case)
        if (category === 'cab booking') {
          return purpose === 'cab booking';
        }

        // Partial matches for other categories
        if (category === 'flight') return purpose.includes('flight');
        if (category === 'hospital') return purpose.includes('hospital') || purpose.includes('consultation');
        if (category === 'hotel') return purpose.includes('hotel');
        if (category === 'medical') return purpose.includes('medical');
        if (category === 'pickup') return purpose.includes('pickup');
        if (category === 'rental') return purpose.includes('rental');
        if (category === 'visa') return purpose.includes('visa');
        if (category === 'tourism') return purpose.includes('tourism') || purpose.includes('tour');
        if (category === 'concierge') return purpose.includes('concierge');

        // Other category - anything not matching above
        if (category === 'other') {
          const known = ['cab booking', 'flight', 'hotel', 'medical', 'hospital', 'consultation', 'pickup', 'rental', 'visa', 'tourism', 'concierge'];
          return !known.some(k => purpose.includes(k));
        }

        return purpose.includes(category);
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => {
        const searchable = [
          b.purpose,
          b.details?.booking_reference,
          b.details?.vehicle_brand,
          b.details?.vehicle_model,
          b.details?.pickup_address,
          b.details?.drop_address,
          b.details?.hotel_name,
          b.details?.location,
          b.details?.country,
          b.details?.from,
          b.details?.to,
          b.details?.airline,
          b.details?.title,
          b.details?.description,
          b.status,
          b.id,
        ].filter(Boolean).join(' ').toLowerCase();

        return searchable.includes(query);
      });
    }

    return result;
  }, [bookings, activeCategory, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter(b => b.status?.toLowerCase() === 'pending').length,
    confirmed: bookings.filter(b => ['confirmed', 'completed'].includes(b.status?.toLowerCase())).length,
  }), [bookings]);

  // Render category chip - FIXED count logic
  const renderCategory = ({ item }: { item: typeof CATEGORIES[number] }) => {
    const isActive = activeCategory === item.key;

    // FIXED: Proper count logic matching the filter logic
    const count = item.key === 'all'
      ? bookings.length
      : bookings.filter(b => {
        const purpose = b.purpose?.toLowerCase() || '';
        const key = item.key.toLowerCase();

        if (key === 'cab booking') return purpose === 'cab booking';
        if (key === 'flight') return purpose.includes('flight');
        if (key === 'hospital') return purpose.includes('hospital') || purpose.includes('consultation');
        if (key === 'hotel') return purpose.includes('hotel');
        if (key === 'medical') return purpose.includes('medical');
        if (key === 'pickup') return purpose.includes('pickup');
        if (key === 'rental') return purpose.includes('rental');
        if (key === 'visa') return purpose.includes('visa');
        if (key === 'tourism') return purpose.includes('tourism') || purpose.includes('tour');
        if (key === 'concierge') return purpose.includes('concierge');
        if (key === 'other') {
          const known = ['cab booking', 'flight', 'hotel', 'medical', 'hospital', 'consultation', 'pickup', 'rental', 'visa', 'tourism', 'concierge'];
          return !known.some(k => purpose.includes(k));
        }
        return purpose.includes(key);
      }).length;

    return (
      <TouchableOpacity
        style={[s.chip, isActive && s.chipActive]}
        onPress={() => setActiveCategory(item.key)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={item.icon as any}
          size={16}
          color={isActive ? '#fff' : '#305c5d'}
        />
        <Text style={[s.chipText, isActive && s.chipTextActive, { fontFamily: AF.medium }]}>
          {item.label}
        </Text>
        {count > 0 && (
          <View style={[s.chipBadge, isActive && s.chipBadgeActive]}>
            <Text style={[s.chipBadgeText, isActive && s.chipBadgeTextActive, { fontFamily: AF.bold }]}>
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <View>
            <Text style={[s.title, { fontFamily: AF.bold }]}>My Bookings</Text>
            <Text style={[s.subtitle, { fontFamily: AF.regular }]}>
              {stats.total} total • {stats.pending} pending • {stats.confirmed} confirmed
            </Text>
          </View>
          <TouchableOpacity
            style={s.searchBtn}
            onPress={() => setShowSearch(!showSearch)}
            activeOpacity={0.8}
          >
            <Ionicons name={showSearch ? "close" : "search"} size={22} color="#305c5d" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View style={s.searchWrap}>
            <Ionicons name="search" size={18} color="#999" />
            <TextInput
              style={[s.searchInput, { fontFamily: AF.medium }]}
              placeholder="Search bookings, references, locations..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Categories */}
      <View style={s.categoriesWrap}>
        <FlatList
          horizontal
          data={CATEGORIES}
          renderItem={renderCategory}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.categoriesList}
        />
      </View>

      {/* Debug Info - Remove after testing */}
      {__DEV__ && (
        <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
          <Text style={{ fontSize: 11, color: '#999', fontFamily: AF.regular }}>
            Debug: {bookings.length} total bookings | Current filter: {activeCategory}
          </Text>
        </View>
      )}

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#305c5d" />
        }
        ListEmptyComponent={<EmptyState searchQuery={searchQuery} activeCategory={activeCategory} />}
        renderItem={({ item }) => <BookingCard item={item} />}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ede6df' },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    color: '#000',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fbf6f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbf6f4',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    marginTop: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },

  // Categories
  categoriesWrap: {
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fbf6f4',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2d7c2',
  },
  chipActive: {
    backgroundColor: '#305c5d',
    borderColor: '#305c5d',
  },
  chipText: {
    fontSize: 13,
    color: '#305c5d',
  },
  chipTextActive: {
    color: '#fff',
  },
  chipBadge: {
    backgroundColor: '#dabf7e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  chipBadgeActive: {
    backgroundColor: '#fff',
  },
  chipBadgeText: {
    fontSize: 10,
    color: '#fff',
  },
  chipBadgeTextActive: {
    color: '#305c5d',
  },

  // List
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fbf6f4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardPurpose: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardDateSmall: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  cardBody: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    color: '#000',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardId: {
    fontSize: 12,
    color: '#999',
  },
  cardPrice: {
    fontSize: 16,
    color: '#305c5d',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fbf6f4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#305c5d',
  },

  // Empty State
  empty: {
    paddingVertical: 80,
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#000',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});