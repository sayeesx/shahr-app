import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Animated,
  Dimensions,
  Platform,
  Easing,
  StatusBar,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image } from 'expo-image';

import { AF } from '../../lib/authTheme';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Types ────────────────────────────────────────────────────────────────────

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

type BookingStatus = {
  id: string;
  booking_reference: string;
  booking_id: string | null;
  passenger_name: string;
  passenger_phone: string;
  passenger_email: string | null;
  passenger_count: number | null;
  pickup_address: string;
  drop_address: string;
  pickup_date: string;
  pickup_time: string;
  driver_id: string | null;
  driver_name: string | null;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  vehicle_type: string | null;
  price_per_km: number | null;
  estimated_distance_km: number | null;
  base_fare: number | null;
  total_fare: number | null;
  status: string;
  status_history: any | null;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  driver_assigned_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
};

type CombinedBooking = Booking & {
  statusData?: BookingStatus;
};

// ── Theme Colors ────────────────────────────────────────────────────────────

const THEME = {
  primary: '#305c5d',
  accent: '#dabf7e',
  background: '#ede6df',
  card: '#fbf6f4',
  white: '#fff',
  success: '#305c5d',
  error: '#c45c4a',
  warning: '#b8956a',
  text: '#000',
  textSecondary: '#666',
};

// ── Status Pipeline ─────────────────────────────────────────────────────────

const STATUS_PIPELINE = [
  { key: 'pending', label: 'Requested', timestampField: 'created_at' },
  { key: 'confirmed', label: 'Confirmed', timestampField: 'confirmed_at' },
  { key: 'in_progress', label: 'Processing', timestampField: 'driver_assigned_at' },
  { key: 'completed', label: 'Completed', timestampField: 'completed_at' },
];

const STATUS_META: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  pending: { color: THEME.warning, bg: 'rgba(184, 149, 106, 0.15)', label: 'Pending', icon: 'time-outline' },
  in_progress: { color: THEME.primary, bg: 'rgba(48, 92, 93, 0.15)', label: 'Processing', icon: 'sync-outline' },
  confirmed: { color: THEME.success, bg: 'rgba(48, 92, 93, 0.15)', label: 'Confirmed', icon: 'checkmark-circle-outline' },
  completed: { color: THEME.success, bg: 'rgba(48, 92, 93, 0.15)', label: 'Completed', icon: 'checkmark-done-outline' },
  cancelled: { color: THEME.error, bg: 'rgba(196, 92, 74, 0.15)', label: 'Cancelled', icon: 'close-circle-outline' },
  rejected: { color: THEME.error, bg: 'rgba(196, 92, 74, 0.15)', label: 'Rejected', icon: 'close-circle-outline' },
};

// ── Categories ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'grid-outline' },
  { key: 'Cab Booking', label: 'Cabs', icon: 'car-sport-outline' },
  { key: 'flight', label: 'Flights', icon: 'airplane-outline' },
  { key: 'hospital', label: 'Hospital', icon: 'medical-outline' },
  { key: 'hotel', label: 'Hotels', icon: 'bed-outline' },
  { key: 'medical', label: 'Medical', icon: 'fitness-outline' },
  { key: 'pickup', label: 'Pickup', icon: 'navigate-outline' },
  { key: 'rental', label: 'Rentals', icon: 'key-outline' },
  { key: 'visa', label: 'Visa', icon: 'document-text-outline' },
  { key: 'tourism', label: 'Tours', icon: 'earth-outline' },
  { key: 'concierge', label: 'Concierge', icon: 'headset-outline' },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-circle-outline' },
] as const;

// ── Helpers ──────────────────────────────────────────────────────────────────

const getStatusMeta = (status: string) =>
  STATUS_META[status?.toLowerCase()] || { color: THEME.primary, bg: 'rgba(48, 92, 93, 0.1)', label: status, icon: 'bookmark-outline' };

const getPipelineStep = (status: string): number => {
  const s = status?.toLowerCase();
  if (s === 'cancelled' || s === 'rejected') return -1;
  const idx = STATUS_PIPELINE.findIndex(p => p.key === s);
  return idx === -1 ? 0 : idx;
};

const getCategoryIcon = (purpose: string) => {
  const p = purpose?.toLowerCase() || '';
  if (p === 'cab booking') return 'car-sport-outline';
  if (p.includes('flight')) return 'airplane-outline';
  if (p.includes('hotel')) return 'bed-outline';
  if (p.includes('medical')) return 'fitness-outline';
  if (p.includes('hospital')) return 'medical-outline';
  if (p.includes('pickup')) return 'navigate-outline';
  if (p.includes('rental')) return 'key-outline';
  if (p.includes('visa')) return 'document-text-outline';
  if (p.includes('tour')) return 'earth-outline';
  if (p.includes('concierge')) return 'headset-outline';
  return 'bookmark-outline';
};

const formatDate = (d: string) => {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (d: string) => {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatDateTime = (d: string) => {
  if (!d) return '';
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
};

const formatCurrency = (amount: number | string) => {
  if (!amount) return '';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num ? `₹${num.toLocaleString('en-IN')}` : '';
};

const matchesCategory = (purpose: string, key: string) => {
  const p = purpose?.toLowerCase() || '';
  const k = key.toLowerCase();
  if (k === 'cab booking') return p === 'cab booking';
  if (k === 'flight') return p.includes('flight');
  if (k === 'hospital') return p.includes('hospital') || p.includes('consultation');
  if (k === 'hotel') return p.includes('hotel');
  if (k === 'medical') return p.includes('medical');
  if (k === 'pickup') return p.includes('pickup');
  if (k === 'rental') return p.includes('rental');
  if (k === 'visa') return p.includes('visa');
  if (k === 'tourism') return p.includes('tourism') || p.includes('tour');
  if (k === 'concierge') return p.includes('concierge');
  if (k === 'other') {
    const known = ['cab booking', 'flight', 'hotel', 'medical', 'hospital', 'consultation', 'pickup', 'rental', 'visa', 'tourism', 'concierge'];
    return !known.some(kn => p.includes(kn));
  }
  return p.includes(k);
};

// ── Status Timeline with Actual Timestamps from booking_status ─────────────

const StatusTimeline = ({ item }: { item: CombinedBooking }) => {
  const statusData = item.statusData;
  const currentStep = getPipelineStep(statusData?.status || item.status);
  const isCancelled = (statusData?.status || item.status)?.toLowerCase() === 'cancelled' ||
    (statusData?.status || item.status)?.toLowerCase() === 'rejected';
  const meta = getStatusMeta(statusData?.status || item.status);

  if (isCancelled) {
    return (
      <View style={styles.timelineRow}>
        <View style={styles.timelineStepActive}>
          <View style={[styles.timelineDot, { backgroundColor: THEME.error }]}>
            <Ionicons name="close" size={8} color="#fff" />
          </View>
          <Text style={[styles.timelineLabel, { color: THEME.error, fontFamily: AF.medium }]}>Cancelled</Text>
          {statusData?.cancelled_at && (
            <Text style={styles.timelineTime}>{formatTime(statusData.cancelled_at)}</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.timelineRow}>
      {STATUS_PIPELINE.map((step, idx) => {
        const isDone = idx < currentStep;
        const isCurrent = idx === currentStep;
        const isPending = idx > currentStep;

        // Get actual timestamp from booking_status table
        const timestamp = statusData ? (statusData[step.timestampField as keyof BookingStatus] as string | null) : null;

        return (
          <View key={step.key} style={styles.timelineStep}>
            <View style={[
              styles.timelineDot,
              isDone && { backgroundColor: THEME.success },
              isCurrent && { backgroundColor: THEME.primary, borderWidth: 2, borderColor: THEME.accent },
              isPending && { backgroundColor: '#eee', borderWidth: 1, borderColor: '#ccc' }
            ]}>
              {isDone && <Ionicons name="checkmark" size={8} color="#fff" />}
              {isCurrent && <View style={styles.timelinePulse} />}
            </View>
            <Text
              style={[
                styles.timelineLabel,
                { fontFamily: AF.medium },
                isCurrent && { color: THEME.primary, fontWeight: '600' },
                isDone && { color: THEME.success },
                isPending && { color: '#aaa' }
              ]}
              numberOfLines={1}
            >
              {step.label}
            </Text>
            {timestamp && (
              <Text style={styles.timelineTime}>{formatTime(timestamp)}</Text>
            )}
            {idx < STATUS_PIPELINE.length - 1 && (
              <View style={[
                styles.timelineConnector,
                { backgroundColor: idx < currentStep ? THEME.success : '#eee' }
              ]} />
            )}
          </View>
        );
      })}
    </View>
  );
};

// ── Booking Card (Flight Ticket Style) ──────────────────────────────────────

const BookingCard = React.memo(({ item, index }: { item: CombinedBooking; index: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const statusData = item.statusData;
  const details = item.details || {};

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 240, delay: Math.min(index * 40, 180), useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  // Merge data from bookings.details and booking_status table
  const pickupAddress = statusData?.pickup_address || details.pickup_address || 'N/A';
  const dropAddress = statusData?.drop_address || details.drop_address || 'N/A';
  const distance = statusData?.estimated_distance_km ? `${statusData.estimated_distance_km} km` :
    details.estimated_distance_km ? `${details.estimated_distance_km} km` : '';
  const pricePerKm = statusData?.price_per_km ? `₹${statusData.price_per_km}/km` :
    details.price_per_km ? `₹${details.price_per_km}/km` : '';
  const totalFare = statusData?.total_fare ? formatCurrency(statusData.total_fare) :
    details.total_fare ? formatCurrency(details.total_fare) : '';
  const bookingRef = statusData?.booking_reference || details.booking_reference || item.id.slice(0, 8).toUpperCase();
  const passengerName = statusData?.passenger_name || details.passenger_name || 'N/A';
  const passengerPhone = statusData?.passenger_phone || details.passenger_phone || 'N/A';
  const passengerCount = statusData?.passenger_count ? `${statusData.passenger_count} Passenger(s)` : '';
  const vehicleInfo = `${statusData?.vehicle_brand || details.vehicle_brand || ''} ${statusData?.vehicle_model || details.vehicle_model || ''}`.trim();
  const vehicleType = statusData?.vehicle_type || details.vehicle_type || '';
  const driverName = statusData?.driver_name || details.driver_name || 'Not Assigned';
  const pickupDate = statusData?.pickup_date ? formatDate(statusData.pickup_date) :
    details.pickup_date ? formatDate(details.pickup_date) : '';
  const pickupTime = statusData?.pickup_time ? formatTime(statusData.pickup_time) :
    details.pickup_time ? formatTime(details.pickup_time) : '';
  const currentStatus = statusData?.status || item.status;

  const meta = getStatusMeta(currentStatus);
  const iconName = getCategoryIcon(item.purpose);

  return (
    <Animated.View style={[
      styles.cardOuter,
      { opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }
    ]}>
      {/* Ticket perforated edge */}
      <View style={styles.ticketEdge}>
        <View style={styles.perfTop} />
        <View style={styles.perfCircle} />
        <View style={styles.perfBottom} />
      </View>

      <View style={styles.ticketBody}>
        {/* Header: Ref + Status Badge */}
        <View style={styles.ticketHeader}>
          <View style={styles.ticketRef}>
            <Ionicons name="ticket-outline" size={14} color={THEME.primary} />
            <Text style={[styles.ticketRefCode, { fontFamily: AF.bold }]}>{bookingRef}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
            <Ionicons name={meta.icon as any} size={13} color={meta.color} />
            <Text style={[styles.statusBadgeText, { color: meta.color, fontFamily: AF.medium }]}>{meta.label}</Text>
          </View>
        </View>

        {/* Route: Pickup → Drop */}
        <View style={styles.routeRow}>
          <View style={styles.routePoint}>
            <Ionicons name="location-outline" size={13} color={THEME.primary} />
            <Text style={[styles.routeText, { fontFamily: AF.medium }]} numberOfLines={2}>{pickupAddress}</Text>
          </View>
          <View style={styles.routeArrow}>
            <Ionicons name="arrow-forward" size={14} color="#aaa" />
          </View>
          <View style={[styles.routePoint, { alignItems: 'flex-end' }]}>
            <Ionicons name="navigate-outline" size={13} color={THEME.success} />
            <Text style={[styles.routeText, { fontFamily: AF.medium, textAlign: 'right' }]} numberOfLines={2}>{dropAddress}</Text>
          </View>
        </View>

        {/* Pickup Date & Time */}
        {(pickupDate || pickupTime) && (
          <View style={styles.pickupInfoRow}>
            {pickupDate && (
              <View style={styles.pickupInfoItem}>
                <Ionicons name="calendar-outline" size={12} color={THEME.primary} />
                <Text style={styles.pickupInfoText}>{pickupDate}</Text>
              </View>
            )}
            {pickupTime && (
              <View style={styles.pickupInfoItem}>
                <Ionicons name="time-outline" size={12} color={THEME.primary} />
                <Text style={styles.pickupInfoText}>{pickupTime}</Text>
              </View>
            )}
          </View>
        )}

        {/* Compact Details Row */}
        <View style={styles.detailsRow}>
          {vehicleInfo ? (
            <View style={styles.detailChip}>
              <Ionicons name="car-outline" size={11} color="#888" />
              <Text style={styles.detailText} numberOfLines={1}>{vehicleInfo}</Text>
            </View>
          ) : null}
          {vehicleType ? (
            <View style={styles.detailChip}>
              <Ionicons name="cube-outline" size={11} color="#888" />
              <Text style={styles.detailText}>{vehicleType}</Text>
            </View>
          ) : null}
          {driverName && driverName !== 'Not Assigned' && driverName !== 'N/A' ? (
            <View style={styles.detailChip}>
              <Ionicons name="person-outline" size={11} color="#888" />
              <Text style={styles.detailText} numberOfLines={1}>{driverName}</Text>
            </View>
          ) : null}
          {distance ? (
            <View style={styles.detailChip}>
              <Ionicons name="speedometer-outline" size={11} color="#888" />
              <Text style={styles.detailText}>{distance}</Text>
            </View>
          ) : null}
          {passengerName && passengerName !== 'N/A' ? (
            <View style={styles.detailChip}>
              <Ionicons name="people-outline" size={11} color="#888" />
              <Text style={styles.detailText} numberOfLines={1}>{passengerName}</Text>
            </View>
          ) : null}
        </View>

        {/* Dashed Divider */}
        <View style={styles.divider}>
          <View style={styles.dashedLine} />
        </View>

        {/* Status Timeline with Timestamps from booking_status */}
        <View style={styles.timelineContainer}>
          <StatusTimeline item={item} />
        </View>

        {/* Footer: Created Date + Price */}
        <View style={styles.ticketFooter}>
          <View style={styles.footerLeft}>
            <Ionicons name="calendar-outline" size={12} color="#999" />
            <Text style={styles.footerDate}>Booked: {formatDateTime(statusData?.created_at || item.created_at)}</Text>
          </View>
          {totalFare ? (
            <Text style={[styles.footerPrice, { color: meta.color, fontFamily: AF.bold }]}>{totalFare}</Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
});

// ── Summary Cards ───────────────────────────────────────────────────────────

const SummaryCards = ({ total, pending, confirmed }: { total: number; pending: number; confirmed: number }) => (
  <View style={styles.summaryContainer}>
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryNum, { fontFamily: AF.bold }]}>{total}</Text>
      <Text style={styles.summaryLbl}>Total</Text>
    </View>
    <View style={styles.summarySep} />
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryNum, { color: THEME.warning, fontFamily: AF.bold }]}>{pending}</Text>
      <Text style={styles.summaryLbl}>Pending</Text>
    </View>
    <View style={styles.summarySep} />
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryNum, { color: THEME.success, fontFamily: AF.bold }]}>{confirmed}</Text>
      <Text style={styles.summaryLbl}>Confirmed</Text>
    </View>
  </View>
);

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const session = useAppStore((s) => s.session);

  const [bookings, setBookings] = useState<CombinedBooking[]>([]);
  const [bookingStatuses, setBookingStatuses] = useState<BookingStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerOpacity, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [headerOpacity]);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      // Fetch from bookings table
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch from booking_status table
      const { data: statusData, error: statusError } = await supabase
        .from('booking_status')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusError) throw statusError;

      setBookings(bookingsData || []);
      setBookingStatuses(statusData || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  }, []);

  // Combine bookings with their status data
  const combinedBookings = useMemo(() => {
    return bookings.map(booking => {
      const bookingRef = booking.details?.booking_reference;
      const statusData = bookingStatuses.find(
        status => status.booking_reference === bookingRef || status.booking_id === booking.id
      );
      return { ...booking, statusData };
    });
  }, [bookings, bookingStatuses]);

  const filteredBookings = useMemo(() => {
    return combinedBookings.filter(booking => {
      const matchesCategoryFilter = activeCategory === 'all' || matchesCategory(booking.purpose, activeCategory);
      const details = booking.details || {};
      const statusData = booking.statusData;
      const matchesSearch = searchQuery === '' ||
        booking.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        details.booking_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        statusData?.booking_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        details.passenger_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        statusData?.passenger_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        details.pickup_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        statusData?.pickup_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategoryFilter && matchesSearch;
    });
  }, [combinedBookings, activeCategory, searchQuery]);

  const stats = useMemo(() => ({
    total: combinedBookings.length,
    pending: combinedBookings.filter(b => (b.statusData?.status || b.status)?.toLowerCase() === 'pending').length,
    confirmed: combinedBookings.filter(b => {
      const status = (b.statusData?.status || b.status)?.toLowerCase();
      return status === 'confirmed' || status === 'completed' || status === 'in_progress';
    }).length,
  }), [combinedBookings]);

  const renderHeader = () => (
    <Animated.View style={[{ opacity: headerOpacity }]}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={THEME.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerSubtitle, { fontFamily: AF.medium }]}>{combinedBookings.length} reservations</Text>
          <Text style={[styles.headerTitle, { fontFamily: AF.playfairBold }]}>My Bookings</Text>
        </View>
      </View>

      {/* Main Form Card with distinct sections */}
      <View style={styles.formCard}>

        {/* ── Search Container (Distinct from card) ── */}
        <View style={styles.searchContainer}>
          <View style={styles.searchIconWrap}>
            <Ionicons name="search-outline" size={20} color={THEME.primary} />
          </View>
          <TextInput
            style={[styles.searchInput, { fontFamily: AF.medium }]}
            placeholder="Search bookings..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
              <Ionicons name="close-circle" size={18} color="#bbb" />
            </TouchableOpacity>
          )}
        </View>

        {/* Summary inside form card but visually separated */}
        <View style={styles.summaryWrap}>
          <SummaryCards total={stats.total} pending={stats.pending} confirmed={stats.confirmed} />
        </View>

        <View style={styles.formDivider} />

        {/* Category filters */}
        <View style={styles.filterRow}>
          <Text style={[styles.filterTitle, { fontFamily: AF.bold }]}>Category</Text>
          <TouchableOpacity onPress={() => setShowMoreFilters(!showMoreFilters)}>
            <Text style={[styles.filterToggle, { fontFamily: AF.semibold }]}>{showMoreFilters ? 'Show Less' : 'Show More'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterGrid}>
          {CATEGORIES.slice(0, showMoreFilters ? CATEGORIES.length : 4).map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.filterChip, activeCategory === item.key && styles.filterChipActive]}
              activeOpacity={0.8}
              onPress={() => setActiveCategory(item.key)}
            >
              <Ionicons name={item.icon as any} size={20} color={activeCategory === item.key ? THEME.accent : THEME.primary} />
              <Text style={[styles.filterChipText, activeCategory === item.key && styles.filterChipTextActive, { fontFamily: AF.semibold }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { fontFamily: AF.bold }]}>Recent Bookings</Text>
        <Text style={[styles.sectionCount, { fontFamily: AF.medium }]}>{filteredBookings.length} Total</Text>
      </View>
    </Animated.View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={[styles.loadingText, { fontFamily: AF.medium }]}>Loading bookings...</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <Ionicons name="receipt-outline" size={48} color="#ccc" />
        <Text style={[styles.emptyStateText, { fontFamily: AF.medium }]}>
          {searchQuery ? 'No results found' : activeCategory === 'all' ? 'No bookings yet' : `No ${activeCategory} bookings`}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <FlatList
        style={styles.listStyle}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 120 }]}
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <BookingCard item={item} index={index} />}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.primary} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.background },
  listStyle: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: THEME.card, alignItems: 'center', justifyContent: 'center' },
  headerTitleWrap: { flex: 1, marginLeft: 14 },
  headerSubtitle: { fontSize: 13, color: THEME.accent, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontSize: 24, color: THEME.text, letterSpacing: -0.5 },

  // Main form card
  formCard: { backgroundColor: THEME.white, marginHorizontal: 20, borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#eee' },

  // ── Distinct Search Container ──
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  searchIconWrap: { width: 28, alignItems: 'center', marginRight: 6 },
  searchInput: { flex: 1, fontSize: 15, color: THEME.text, paddingVertical: 2 },
  searchClear: { padding: 3 },

  // Summary section
  summaryWrap: { marginVertical: 10, paddingHorizontal: 4 },
  summaryContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 8 },
  summaryItem: { alignItems: 'center', paddingHorizontal: 10 },
  summarySep: { width: 1, height: 28, backgroundColor: '#f0f0f0' },
  summaryNum: { fontSize: 20, color: THEME.text, letterSpacing: -0.3 },
  summaryLbl: { fontSize: 11, color: THEME.textSecondary, textTransform: 'uppercase', marginTop: 3, letterSpacing: 0.3 },

  formDivider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10, marginLeft: 28 },

  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, marginBottom: 10 },
  filterTitle: { fontSize: 14, color: THEME.text },
  filterToggle: { fontSize: 12, color: THEME.primary },

  filterGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 8 },
  filterChip: { borderRadius: 16, backgroundColor: THEME.card, borderWidth: 1, borderColor: '#eee', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 8, width: '23%' },
  filterChipActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  filterChipText: { fontSize: 11, color: '#666', textAlign: 'center', marginTop: 5 },
  filterChipTextActive: { color: THEME.accent },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 17, color: THEME.text },
  sectionCount: { fontSize: 14, color: '#888' },

  // ── Booking Card Styles ──
  cardOuter: {
    flexDirection: 'row',
    backgroundColor: THEME.white,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },

  // Ticket perforated edge
  ticketEdge: { width: 8, backgroundColor: THEME.card, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#e0e0e0' },
  perfTop: { width: 5, height: 8, backgroundColor: THEME.background, borderBottomLeftRadius: 2.5, borderBottomRightRadius: 2.5 },
  perfCircle: { width: 13, height: 13, borderRadius: 7, backgroundColor: THEME.background, marginVertical: 3 },
  perfBottom: { width: 5, height: 8, backgroundColor: THEME.background, borderTopLeftRadius: 2.5, borderTopRightRadius: 2.5 },

  ticketBody: { flex: 1, padding: 14 },

  // Header
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketRef: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ticketRefCode: { fontSize: 12, color: THEME.primary, letterSpacing: 0.5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 5 },
  statusBadgeText: { fontSize: 10 },

  // Route section
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 5 },
  routePoint: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  routeText: { fontSize: 12, color: THEME.text, flex: 1, lineHeight: 18 },
  routeArrow: { paddingHorizontal: 4, paddingTop: 2 },

  // Pickup info
  pickupInfoRow: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  pickupInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pickupInfoText: { fontSize: 11, color: THEME.textSecondary, fontFamily: AF.medium },

  // Details chips
  detailsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 6 },
  detailChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: THEME.card, borderRadius: 6 },
  detailText: { fontSize: 10, color: '#666' },

  // Dashed divider
  divider: { marginVertical: 5 },
  dashedLine: { height: 1, backgroundColor: 'transparent', borderWidth: 0.5, borderColor: '#ccc', borderStyle: 'dashed' },

  // Timeline
  timelineContainer: { marginBottom: 6 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timelineStep: { alignItems: 'center', flex: 1, paddingHorizontal: 2 },
  timelineStepActive: { alignItems: 'center' },
  timelineDot: { width: 13, height: 13, borderRadius: 7, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  timelinePulse: { position: 'absolute', width: 18, height: 18, borderRadius: 9, backgroundColor: THEME.primary + '30' },
  timelineLabel: { fontSize: 9, textAlign: 'center', paddingHorizontal: 1, fontFamily: AF.medium },
  timelineTime: { fontSize: 8, color: '#999', textAlign: 'center', marginTop: 1 },
  timelineConnector: { position: 'absolute', top: 6, left: '50%', right: '-50%', height: 1 },

  // Footer
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTopWidth: 0.5, borderTopColor: '#e8e8e8' },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerDate: { fontSize: 10, color: '#999' },
  footerPrice: { fontSize: 14 },

  // Empty & Loading
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { marginTop: 14, fontSize: 15, color: '#888' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 14 },
  loadingText: { fontSize: 14, color: THEME.textSecondary },
}); 