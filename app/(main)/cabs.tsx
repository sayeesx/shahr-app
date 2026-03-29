import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { supabase } from '../../lib/supabase';
import { AF } from '../../lib/authTheme';
import { useAppStore } from '../../store/useAppStore';
import { router } from 'expo-router';
import { CountryPicker, COUNTRIES, Country } from '../../components/auth/CountryPicker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── Types ───────────────────────────────────────────────────────────────────────

type Cab = {
  driver_id: string;
  driver_name: string;
  driver_image: string;
  vehicle_image: string;
  rating: number;
  trips: number;
  experience: string;
  vehicle_brand: string;
  vehicle_model: string;
  vehicle_type: string;
  ac_available: boolean;
  seats: number;
  languages: string[] | string;
  price_per_km: number;
  current_city: string;
};

type Rental = {
  id: string;
  image: string;
  name: string;
  transmission: string;
  price_per_day: number;
  rating: number;
};

type Location = {
  id: string;
  name: string;
  district: string;
  type: string;
};

type BookingStatus = 'form' | 'loading' | 'success' | 'error';

// ── Theme Colors ──────────────────────────────────────────────────────────────────

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
  lightGray: '#f5f5f5',
};

// ── Shimmer Skeleton Component ───────────────────────────────────────────────────

const Shimmer = memo(({ width = '100%', height = 16, borderRadius = 4, style }: any) => {
  const translateX = useSharedValue(-SCREEN_WIDTH);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    translateX.value = withRepeat(
      withTiming(SCREEN_WIDTH, { duration: 1500, easing: Easing.ease }),
      -1,
      false
    );

    return () => {
      setIsActive(false);
    };
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[{ width, height, borderRadius, backgroundColor: '#e6dfd8', overflow: 'hidden' }, style]}>
      <Animated.View style={[{ width: '100%', height: '100%' }, animatedStyle]}>
        <View style={{ width: SCREEN_WIDTH, height: '100%', backgroundColor: 'transparent' }}>
          <View
            style={{
              width: 100,
              height: '100%',
              backgroundColor: 'rgba(255,255,255,0.5)',
              shadowColor: '#fff',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: 20,
            }}
          />
        </View>
      </Animated.View>
    </View>
  );
});

// ── Modern Cab Card Skeleton ─────────────────────────────────────────────────────

const CabCardSkeleton = memo(() => {
  const cardWidth = (SCREEN_WIDTH - 52) / 2;

  return (
    <View style={[skeletonStyles.card, { width: cardWidth }]}>
      <View style={skeletonStyles.imageContainer}>
        <Shimmer width="100%" height="100%" borderRadius={16} />
      </View>
      <View style={skeletonStyles.infoContainer}>
        <Shimmer width="80%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
        <Shimmer width="60%" height={12} borderRadius={4} style={{ marginBottom: 10 }} />
        <View style={{ gap: 4, marginBottom: 10, flexDirection: 'row' }}>
          <Shimmer width={30} height={14} borderRadius={4} />
          <Shimmer width={30} height={14} borderRadius={4} />
          <Shimmer width={30} height={14} borderRadius={4} />
        </View>
        <View style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0' }}>
          <Shimmer width={50} height={18} borderRadius={4} />
        </View>
      </View>
    </View>
  );
});

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: THEME.white,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 85,
    backgroundColor: '#F8F9FA',
    padding: 10,
  },
  infoContainer: {
    padding: 10,
    paddingTop: 12,
  },
});

// ── Skeleton Loader Container Component ───────────────────────────────────────────

interface SkeletonLoaderProps {
  count?: number;
  loading: boolean;
  children: React.ReactNode;
}

const CabSkeletonLoader = memo(({ count = 4, loading, children }: SkeletonLoaderProps) => {
  if (!loading) return <>{children}</>;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, justifyContent: 'space-between' }}>
      {Array.from({ length: count }).map((_, index) => (
        <CabCardSkeleton key={index} />
      ))}
    </View>
  );
});

// ── Animated Status Icon Component ────────────────────────────────────────────────

const AnimatedStatusIcon = memo(({ status }: { status: 'success' | 'error' }) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 300 });

    if (status === 'success') {
      rotation.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    } else {
      rotation.value = withSequence(
        withTiming(-15, { duration: 50 }),
        withTiming(15, { duration: 50 }),
        withTiming(-15, { duration: 50 }),
        withTiming(15, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [status]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: opacity.value,
  }));

  const circleColor = status === 'success' ? THEME.success : THEME.error;
  const iconName = status === 'success' ? 'checkmark' : 'close';
  const iconColor = THEME.white;

  return (
    <Animated.View
      style={[
        {
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: circleColor,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: circleColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 10,
        },
        animatedStyle,
      ]}
    >
      <Ionicons name={iconName} size={56} color={iconColor} />
    </Animated.View>
  );
});

// ── Helpers ─────────────────────────────────────────────────────────────────────

const getVehicleImage = (type: string, url?: string) => {
  if (url && url.startsWith('http')) return { uri: url };
  const t = (type || '').toLowerCase().replace(/\s+/g, '');
  if (t.includes('hatchback')) return require('../../assets/cabs/hatchback.png');
  if (t.includes('premiumsedan')) return require('../../assets/cabs/premiumsedan.png');
  if (t.includes('luxurysuv') || t.includes('premiumsuv')) return require('../../assets/cabs/luxurysuv.png');
  if (t.includes('sedan')) return require('../../assets/cabs/sedan.png');
  if (t.includes('suv')) return require('../../assets/cabs/suv.png');
  return require('../../assets/cabs/sedan.png');
};

const FILTERS = [
  { label: 'All', image: null },
  { label: 'Hatchback', image: require('../../assets/cabs/hatchback.png') },
  { label: 'Sedan', image: require('../../assets/cabs/sedan.png') },
  { label: 'SUV/XL', image: require('../../assets/cabs/suv.png') },
  { label: 'Premium Sedan', image: require('../../assets/cabs/premiumsedan.png') },
  { label: 'Luxury SUV', image: require('../../assets/cabs/luxurysuv.png') },
  { label: 'Top Rated', image: null },
];

// ── Sub-components ──────────────────────────────────────────────────────────────

const RentalCard = memo(({ item }: { item: Rental }) => (
  <TouchableOpacity style={rentalStyles.card} activeOpacity={0.8}>
    <Image
      source={{ uri: item.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2' }}
      style={rentalStyles.img}
      contentFit="cover"
    />
    <View style={rentalStyles.body}>
      <Text style={[rentalStyles.name, { fontFamily: AF.bold }]} numberOfLines={1}>{item.name}</Text>
      <Text style={[rentalStyles.prop, { fontFamily: AF.medium }]}>
        {item.transmission || 'Auto'} • <Ionicons name="star" color={THEME.accent} size={12} /> {item.rating || '4.5'}
      </Text>
      <View style={rentalStyles.footer}>
        <Text style={[rentalStyles.price, { fontFamily: AF.bold }]}>₹{item.price_per_day}/day</Text>
        <TouchableOpacity style={rentalStyles.btn} activeOpacity={0.8}>
          <Text style={[rentalStyles.btnText, { fontFamily: AF.bold }]}>Rent Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
));

const rentalStyles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: THEME.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.white,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  img: { width: '100%', height: 120, backgroundColor: THEME.background },
  body: { padding: 12 },
  name: { fontSize: 16, color: THEME.text, marginBottom: 4 },
  prop: { fontSize: 13, color: '#666', marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 14, color: THEME.primary },
  btn: { backgroundColor: THEME.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  btnText: { color: THEME.white, fontSize: 12 },
});

// ── Modern Cab Card ─────────────────────────────────────────────────────────────

const CabCard = memo(({ item, index, onSelect }: { item: Cab; index: number; onSelect: (cab: Cab) => void }) => {
  const cardWidth = (SCREEN_WIDTH - 52) / 2;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400)}
      style={[cabStyles.card, { width: cardWidth }]}
    >
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => onSelect(item)}
        activeOpacity={0.9}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {/* Clean Image Container */}
        <View style={cabStyles.imageContainer}>
          <Image
            source={getVehicleImage(item.vehicle_type, item.vehicle_image)}
            style={cabStyles.cardImage}
            contentFit="contain"
          />
        </View>

        {/* Modern Info Section */}
        <View style={cabStyles.infoContainer}>
          {/* Brand & Model */}
          <Text style={[cabStyles.brandText, { fontFamily: AF.bold }]} numberOfLines={1}>
            {item.vehicle_brand} <Text style={{ fontFamily: AF.medium, color: '#666' }}>{item.vehicle_model}</Text>
          </Text>

          {/* Driver & Rating Row */}
          <View style={cabStyles.metaRow}>
            <View style={cabStyles.ratingBadge}>
              <Ionicons name="star" size={10} color={THEME.white} />
              <Text style={[cabStyles.ratingText, { fontFamily: AF.semibold }]}>{item.rating}</Text>
            </View>
            <Text style={[cabStyles.driverText, { fontFamily: AF.regular }]} numberOfLines={1}>
              {item.driver_name}
            </Text>
          </View>

          {/* Features Tags */}
          <View style={cabStyles.tagsRow}>
            <View style={cabStyles.tag}>
              <Ionicons name="people-outline" size={10} color="#555" />
              <Text style={[cabStyles.tagText, { fontFamily: AF.medium }]}>{item.seats}</Text>
            </View>
            {item.ac_available && (
              <View style={cabStyles.tag}>
                <Ionicons name="snow-outline" size={10} color="#555" />
                <Text style={[cabStyles.tagText, { fontFamily: AF.medium }]}>AC</Text>
              </View>
            )}
            <View style={cabStyles.tag}>
              <Ionicons name="briefcase-outline" size={10} color="#555" />
              <Text style={[cabStyles.tagText, { fontFamily: AF.medium }]}>Luggage</Text>
            </View>
          </View>

          {/* Price Section - Now in details */}
          <View style={cabStyles.priceSection}>
            <Text style={[cabStyles.priceText, { fontFamily: AF.bold }]}>
              ₹{item.price_per_km}
            </Text>
            <Text style={[cabStyles.priceUnit, { fontFamily: AF.regular }]}>/km</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const cabStyles = StyleSheet.create({
  card: {
    backgroundColor: THEME.white,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 85,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 10,
    paddingTop: 12,
  },
  brandText: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  ratingText: {
    fontSize: 10,
    color: THEME.white,
  },
  driverText: {
    fontSize: 11,
    color: '#888',
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  tagText: {
    fontSize: 9,
    color: '#555',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  priceText: {
    fontSize: 18,
    color: '#1A1A1A',
  },
  priceUnit: {
    fontSize: 12,
    color: '#888',
    marginLeft: 2,
  },
});

// ── Main Component ──────────────────────────────────────────────────────────────

export default function CabsScreen() {
  const insets = useSafeAreaInsets();
  const session = useAppStore((s) => s.session);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  // List state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefresh] = useState(false);
  const [cabs, setCabs] = useState<Cab[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // Search state
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [pickupFocus, setPickupFocus] = useState(false);
  const [dropFocus, setDropFocus] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Booking sheet state
  const [selectedCab, setSelectedCab] = useState<Cab | null>(null);
  const [mockDistance, setMockDistance] = useState(10);
  const [isOpeningSheet, setIsOpeningSheet] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('form');
  const [bookingRef, setBookingRef] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Booking form fields
  const [bName, setBName] = useState('');
  const [bPhone, setBPhone] = useState('');
  const [bEmail, setBEmail] = useState('');
  const [bPickup, setBPickup] = useState('');
  const [bDrop, setBDrop] = useState('');
  const [bReq, setBReq] = useState('');
  const [bCountry, setBCountry] = useState<Country>(COUNTRIES[0]);
  const [phoneError, setPhoneError] = useState('');

  const sheetSnapPoints = useMemo(() => {
    if (bookingStatus === 'success' || bookingStatus === 'error') {
      return ['50%'];
    }
    return ['90%'];
  }, [bookingStatus]);

  useEffect(() => {
    if (bookingStatus === 'success' || bookingStatus === 'error') {
      bottomSheetRef.current?.snapToIndex(0);
    }
  }, [bookingStatus]);

  // ── Data fetching ─────────────────────────────────────────────────────────────

  const fetchLists = useCallback(async () => {
    try {
      const [cabsRes, rentalsRes, locsRes] = await Promise.all([
        supabase.from('available_drivers_with_vehicles').select('*'),
        supabase.from('available_rental_vehicles').select('*'),
        supabase.from('locations').select('*').eq('is_active', true).order('popularity_score', { ascending: false }),
      ]);

      if (!locsRes.error && locsRes.data) setLocations(locsRes.data as Location[]);

      if (!cabsRes.error && cabsRes.data) {
        setCabs(cabsRes.data.map((d: any) => ({
          driver_id: d.driver_id,
          driver_name: d.full_name,
          driver_image: d.profile_image_url,
          vehicle_image: d.vehicle_image,
          rating: d.rating,
          trips: d.total_trips,
          experience: d.years_of_experience,
          vehicle_brand: d.brand,
          vehicle_model: d.model,
          vehicle_type: d.vehicle_type,
          ac_available: d.has_ac,
          seats: d.seating_capacity,
          languages: d.languages,
          price_per_km: d.price_per_km,
          current_city: d.current_city,
        })) as Cab[]);
      }

      if (!rentalsRes.error && rentalsRes.data) {
        setRentals(rentalsRes.data.map((r: any) => ({
          id: r.id,
          image: r.primary_image_url,
          name: `${r.brand} ${r.model}`,
          transmission: r.transmission,
          price_per_day: r.price_per_day,
          rating: r.avg_rating || 4.5,
        })) as Rental[]);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  }, []);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  const onRefresh = useCallback(() => {
    setRefresh(true);
    fetchLists();
  }, [fetchLists]);

  // ── Derived data ──────────────────────────────────────────────────────────────

  const filteredCabs = useMemo(() => {
    if (!pickup.trim() && !drop.trim()) {
      return [];
    }

    let result = cabs;

    if (activeFilter !== 'All') {
      result = result.filter((c) => {
        if (activeFilter === 'Top Rated') return c.rating >= 4.5;
        const vType = (c.vehicle_type || '').toLowerCase();
        const filterType = activeFilter.toLowerCase();
        if (filterType === 'suv/xl') return vType === 'suv' || vType === 'suv/xl';
        return vType === filterType;
      });
    }

    if (pickup.trim() || drop.trim()) {
      const pSearch = pickup.toLowerCase().trim();
      const dSearch = drop.toLowerCase().trim();
      result = result.filter((c) => {
        const city = (c.current_city || '').toLowerCase();
        const brand = (c.vehicle_brand || '').toLowerCase();
        const model = (c.vehicle_model || '').toLowerCase();
        const driver = (c.driver_name || '').toLowerCase();
        return (
          city.includes(pSearch) || city.includes(dSearch) ||
          brand.includes(pSearch) || brand.includes(dSearch) ||
          model.includes(pSearch) || model.includes(dSearch) ||
          driver.includes(pSearch) || driver.includes(dSearch)
        );
      });
    }

    return result;
  }, [cabs, activeFilter, pickup, drop]);

  const filteredPickupLocs = useMemo(() => {
    if (!pickup) return locations.slice(0, 5);
    return locations.filter(l =>
      l.name.toLowerCase().includes(pickup.toLowerCase()) ||
      l.district.toLowerCase().includes(pickup.toLowerCase())
    ).slice(0, 5);
  }, [pickup, locations]);

  const filteredDropLocs = useMemo(() => {
    if (!drop) return locations.slice(0, 5);
    return locations.filter(l =>
      l.name.toLowerCase().includes(drop.toLowerCase()) ||
      l.district.toLowerCase().includes(drop.toLowerCase())
    ).slice(0, 5);
  }, [drop, locations]);

  // ── Booking logic ─────────────────────────────────────────────────────────────

  const onSelectCab = useCallback((cab: Cab) => {
    Keyboard.dismiss();
    setPickupFocus(false);
    setDropFocus(false);

    if (!pickup.trim() || !drop.trim()) {
      return;
    }

    if (!session?.user?.id) {
      router.push('/(auth)/index' as any);
      return;
    }

    if (isOpeningSheet) return;
    setIsOpeningSheet(true);
    setSelectedCab(cab);
    setMockDistance(Math.floor(Math.random() * 15) + 5);
    setBPickup(pickup);
    setBDrop(drop);
    setBookingStatus('form');
    setBookingRef('');
    setBookingError('');

    const meta = session.user.user_metadata || {};
    setBName(meta.name || '');
    setBEmail(session.user.email || '');

    let phoneStr = meta.phone || '';
    let matchedCountry = COUNTRIES[0];
    for (const c of COUNTRIES) {
      if (phoneStr.startsWith(c.dial)) {
        matchedCountry = c;
        phoneStr = phoneStr.replace(c.dial, '').trim();
        break;
      }
    }
    setBCountry(matchedCountry);
    setBPhone(phoneStr);
    setPhoneError('');
    setBReq('');

    setTimeout(() => {
      bottomSheetRef.current?.present();
      setIsOpeningSheet(false);
    }, 150);
  }, [pickup, drop, session, isOpeningSheet]);

  const submitBooking = useCallback(() => {
    if (!selectedCab) return;
    
    setPhoneError('');
    let hasError = false;

    if (!bPhone || bPhone.trim().length < 8) {
      setPhoneError('Please enter a valid phone number');
      hasError = true;
    }

    if (!bName || !bPickup || !bDrop || hasError) {
      return;
    }

    executeBooking();
  }, [selectedCab, bName, bPhone, bPickup, bDrop, bCountry]);

  const executeBooking = async () => {
    if (!selectedCab || !session?.user?.id) return;
    setBookingStatus('loading');

    const totalFare = selectedCab.price_per_km * mockDistance;
    const newBookingRef = `CAB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setBookingRef(newBookingRef);

    try {
      const { error: clientError } = await supabase
        .from('clients')
        .upsert({
          id: session.user.id,
          email: session.user.email,
          name: bName || session.user.user_metadata?.name || 'Unknown',
          phone: `${bCountry.dial}${bPhone}`,
        }, { onConflict: 'id' });

      if (clientError) {
        console.error('Client upsert error:', clientError);
        if (clientError.code === 'PGRST204' || clientError.message.includes('column')) {
          const { error: insertError } = await supabase
            .from('clients')
            .insert({
              id: session.user.id,
              email: session.user.email,
              name: bName || session.user.user_metadata?.name || 'Unknown',
              phone: `${bCountry.dial}${bPhone}`,
            });

          if (insertError && !insertError.message.includes('duplicate') && !insertError.message.includes('23505')) {
            throw new Error(`Client creation failed: ${insertError.message}`);
          }
        } else {
          throw new Error(`Client creation failed: ${clientError.message}`);
        }
      }

      const { error: bookingError } = await supabase.from('bookings').insert({
        client_id: session.user.id,
        purpose: 'Cab Booking',
        status: 'pending',
        details: {
          booking_reference: newBookingRef,
          passenger_name: bName,
          passenger_phone: `${bCountry.dial}${bPhone}`,
          pickup_address: bPickup,
          drop_address: bDrop,
          driver_id: selectedCab.driver_id,
          driver_name: selectedCab.driver_name,
          vehicle_brand: selectedCab.vehicle_brand,
          vehicle_model: selectedCab.vehicle_model,
          vehicle_type: selectedCab.vehicle_type,
          price_per_km: selectedCab.price_per_km,
          estimated_distance_km: mockDistance,
          total_fare: totalFare,
          special_request: bReq.trim() || undefined,
        },
      });

      if (bookingError) throw bookingError;

      await supabase.from('notifications').insert({
        user_id: session.user.id,
        title: 'Booking Confirmed!',
        message: `Your ${selectedCab.vehicle_brand} ${selectedCab.vehicle_model} booking is being processed. Ref: ${newBookingRef}`,
        path: '/(main)/bookings',
      });

      setBookingStatus('success');
    } catch (error: any) {
      console.error('Booking error:', error);
      console.error('Error details:', error.message || 'Unknown error');

      setBookingStatus('error');
      setBookingError('Something went wrong. Please try again.');
    }
  };

  const handleGoBack = useCallback(() => {
    setBookingStatus('form');
    setBookingError('');
  }, []);

  const handleCloseSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    if (bookingStatus === 'success') {
      setPickup('');
      setDrop('');
    }
    setTimeout(() => {
      setBookingStatus('form');
      setBookingError('');
    }, 300);
  }, [bookingStatus]);

  // ── Render helpers ────────────────────────────────────────────────────────────

  const renderHeader = () => (
    <View>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color={THEME.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerSubtitle, { fontFamily: AF.medium }]}>Your Ride Awaits</Text>
          <Text style={[styles.headerTitle, { fontFamily: AF.playfairBold }]}>Book a Cab</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        {/* Pickup */}
        <View style={styles.inputRow}>
          <View style={styles.iconWrap}><Ionicons name="location-outline" size={20} color={THEME.primary} /></View>
          <TextInput
            style={[styles.input, { fontFamily: AF.medium }]}
            placeholder="Pickup Location"
            placeholderTextColor="#999"
            value={pickup}
            onChangeText={setPickup}
            onFocus={() => { setPickupFocus(true); setDropFocus(false); }}
          />
          {pickup.length > 0 && (
            <TouchableOpacity onPress={() => { setPickup(''); setPickupFocus(true); }}>
              <Ionicons name="close-circle" size={16} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        {pickupFocus && filteredPickupLocs.length > 0 && (
          <View style={styles.suggestionsBox}>
            {filteredPickupLocs.map(loc => (
              <TouchableOpacity
                key={loc.id}
                style={styles.suggItem}
                onPress={() => { setPickup(loc.name); setPickupFocus(false); Keyboard.dismiss(); }}
              >
                <Ionicons name="location" size={16} color="#bbb" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={[styles.suggName, { fontFamily: AF.medium }]}>{loc.name}</Text>
                  <Text style={[styles.suggDesc, { fontFamily: AF.regular }]}>{loc.district} • {loc.type}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.formDivider} />

        {/* Drop */}
        <View style={styles.inputRow}>
          <View style={styles.iconWrap}><Ionicons name="location" size={20} color="#f44336" /></View>
          <TextInput
            style={[styles.input, { fontFamily: AF.medium }]}
            placeholder="Drop Location"
            placeholderTextColor="#999"
            value={drop}
            onChangeText={setDrop}
            onFocus={() => { setDropFocus(true); setPickupFocus(false); }}
          />
          {drop.length > 0 && (
            <TouchableOpacity onPress={() => { setDrop(''); setDropFocus(true); }}>
              <Ionicons name="close-circle" size={16} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>

        {dropFocus && filteredDropLocs.length > 0 && (
          <View style={styles.suggestionsBox}>
            {filteredDropLocs.map(loc => (
              <TouchableOpacity
                key={loc.id}
                style={styles.suggItem}
                onPress={() => { setDrop(loc.name); setDropFocus(false); Keyboard.dismiss(); }}
              >
                <Ionicons name="location" size={16} color="#bbb" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={[styles.suggName, { fontFamily: AF.medium }]}>{loc.name}</Text>
                  <Text style={[styles.suggDesc, { fontFamily: AF.regular }]}>{loc.district} • {loc.type}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Vehicle type filters */}
        <View style={styles.filterInnerTitleRow}>
          <Text style={[styles.filterInnerTitle, { fontFamily: AF.bold }]}>Select Vehicle Type</Text>
          <TouchableOpacity style={styles.showMoreBtn} onPress={() => setShowMoreFilters(!showMoreFilters)}>
            <Text style={[styles.showMoreText, { fontFamily: AF.semibold }]}>
              {showMoreFilters ? 'Show Less' : 'Show More'}
            </Text>
            <Ionicons name={showMoreFilters ? 'chevron-up' : 'chevron-down'} size={14} color={THEME.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.filterGrid}>
          {FILTERS.slice(0, showMoreFilters ? FILTERS.length : 4).map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.filterChip,
                activeFilter === item.label && styles.filterChipActive,
                { width: '23%', marginHorizontal: '1%', marginBottom: 16 },
              ]}
              activeOpacity={0.8}
              onPress={() => setActiveFilter(item.label)}
            >
              {item.image && <Image source={item.image} style={styles.filterChipImg} contentFit="contain" />}
              <Text
                numberOfLines={1}
                style={[styles.filterChipText, activeFilter === item.label && styles.filterChipTextActive, { fontFamily: AF.semibold, fontSize: 10 }]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { fontFamily: AF.bold }]}>Available Cabs</Text>
        <Text style={[styles.sectionCount, { fontFamily: AF.medium }]}>{filteredCabs.length} Total</Text>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (!pickup.trim() && !drop.trim()) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={THEME.primary} />
          <Text style={[styles.emptyStateText, { fontFamily: AF.medium, textAlign: 'center', paddingHorizontal: 40 }]}>
            Search for your cabs from your nearest location
          </Text>
        </View>
      );
    }

    if (loading) {
      return (
        <CabSkeletonLoader loading={true} count={4}>
          <></>
        </CabSkeletonLoader>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="car-outline" size={48} color="#ccc" />
        <Text style={[styles.emptyStateText, { fontFamily: AF.medium }]}>No cabs match your filters.</Text>
      </View>
    );
  };

  const renderFooter = () => (
    <View style={styles.rentalContainer}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { fontFamily: AF.bold }]}>Self-Drive Rentals</Text>
        <TouchableOpacity onPress={() => router.push('/(main)/rentals' as any)}>
          <Text style={[styles.viewAllLink, { fontFamily: AF.semibold }]}>View All</Text>
        </TouchableOpacity>
      </View>
      {rentals.length > 0 ? (
        <FlatList
          horizontal
          data={rentals}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <RentalCard item={item} />}
          contentContainerStyle={styles.rentalListContent}
        />
      ) : (
        <Text style={[styles.noRentalsText, { fontFamily: AF.medium }]}>No rental vehicles available.</Text>
      )}
      <View style={{ height: 120 }} />
    </View>
  );

  // ── Render Sheet Content ──────────────────────────────────────────────────────

  const renderSheetContent = () => {
    if (!selectedCab) return null;

    // Loading State
    if (bookingStatus === 'loading') {
      return (
        <View style={sheetStyles.statusContainer}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={[sheetStyles.statusText, { fontFamily: AF.medium }]}>Confirming your booking...</Text>
        </View>
      );
    }

    // Success State
    if (bookingStatus === 'success') {
      return (
        <Animated.View entering={FadeInDown.springify().mass(0.7)} style={sheetStyles.statusContainer}>
          <TouchableOpacity onPress={handleCloseSheet} style={sheetStyles.closeIconBtn}>
            <Ionicons name="close" size={24} color={THEME.textSecondary} />
          </TouchableOpacity>
          <AnimatedStatusIcon status="success" />
          <Text style={[sheetStyles.statusTitle, { fontFamily: AF.bold, color: THEME.success }]}>
            Booking Confirmed!
          </Text>
          <Text style={[sheetStyles.statusSubtitle, { fontFamily: AF.medium }]}>
            Reference: {bookingRef}
          </Text>
          <View style={sheetStyles.statusButtons}>
            <TouchableOpacity
              style={[sheetStyles.statusBtn, { backgroundColor: THEME.primary }]}
              onPress={handleCloseSheet}
            >
              <Text style={[sheetStyles.statusBtnText, { fontFamily: AF.bold, color: THEME.accent }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      );
    }

    // Error State
    if (bookingStatus === 'error') {
      return (
        <Animated.View entering={FadeInDown.springify().mass(0.7)} style={sheetStyles.statusContainer}>
          <TouchableOpacity onPress={handleCloseSheet} style={sheetStyles.closeIconBtn}>
            <Ionicons name="close" size={24} color={THEME.textSecondary} />
          </TouchableOpacity>
          <AnimatedStatusIcon status="error" />
          <Text style={[sheetStyles.statusTitle, { fontFamily: AF.bold, color: THEME.error }]}>
            Booking Failed
          </Text>
          <Text style={[sheetStyles.statusSubtitle, { fontFamily: AF.medium }]}>
            {bookingError}
          </Text>
          <View style={sheetStyles.statusButtons}>
            <TouchableOpacity
              style={[sheetStyles.statusBtnSecondary, { borderColor: THEME.error }]}
              onPress={handleGoBack}
            >
              <Text style={[sheetStyles.statusBtnTextSecondary, { fontFamily: AF.medium, color: THEME.error }]}>
                Go Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[sheetStyles.statusBtn, { backgroundColor: THEME.error }]}
              onPress={executeBooking}
            >
              <Text style={[sheetStyles.statusBtnText, { fontFamily: AF.bold, color: THEME.white }]}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      );
    }

    // Form State (default)
    return (
      <BottomSheetScrollView 
        contentContainerStyle={sheetStyles.formContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={sheetStyles.sheetHeader}>
          <Text style={[sheetStyles.sheetTitle, { fontFamily: AF.bold }]}>Complete Booking</Text>
          <TouchableOpacity onPress={() => bottomSheetRef.current?.dismiss()} style={sheetStyles.sheetCloseBtn}>
            <Ionicons name="close" size={24} color={THEME.text} />
          </TouchableOpacity>
        </View>

        {/* Journey Summary */}
        <View style={sheetStyles.journeySummary}>
          <View style={sheetStyles.dateTimeRow}>
            <Ionicons name="calendar-outline" size={16} color={THEME.textSecondary} />
            <Text style={[sheetStyles.dateTimeText, { fontFamily: AF.medium }]}>
              {new Date().toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </Text>
          </View>
          <View style={sheetStyles.journeyLineDivider} />
          
          <View style={sheetStyles.journeyRow}>
            <View style={sheetStyles.journeyDot}>
              <View style={[sheetStyles.dot, { backgroundColor: THEME.primary }]} />
            </View>
            <Text style={[sheetStyles.journeyText, { fontFamily: AF.medium }]} numberOfLines={1}>{bPickup}</Text>
          </View>
          <View style={sheetStyles.journeyLine} />
          <View style={sheetStyles.journeyRow}>
            <View style={sheetStyles.journeyDot}>
              <View style={[sheetStyles.dot, { backgroundColor: '#f44336' }]} />
            </View>
            <Text style={[sheetStyles.journeyText, { fontFamily: AF.medium }]} numberOfLines={1}>{bDrop}</Text>
          </View>
        </View>

        {/* Cab Summary */}
        <View style={sheetStyles.cabSummary}>
          <View style={sheetStyles.cabImageWrap}>
            <Image
              source={getVehicleImage(selectedCab.vehicle_type, selectedCab.vehicle_image)}
              style={sheetStyles.cabImage}
              contentFit="contain"
            />
          </View>
          <View style={sheetStyles.cabDetails}>
            <Text style={[sheetStyles.cabName, { fontFamily: AF.bold }]}>
              {selectedCab.vehicle_brand} {selectedCab.vehicle_model}
            </Text>
            <Text style={[sheetStyles.cabMeta, { fontFamily: AF.medium }]}>
              {selectedCab.driver_name} • {selectedCab.rating}★
            </Text>
          </View>
          <View style={sheetStyles.cabPrice}>
            <Text style={[sheetStyles.priceValue, { fontFamily: AF.bold }]}>
              ₹{selectedCab.price_per_km * mockDistance}
            </Text>
            <Text style={[sheetStyles.priceLabel, { fontFamily: AF.regular }]}>Total</Text>
          </View>
        </View>

        {/* Fare Breakdown */}
        <View style={sheetStyles.fareBreakdown}>
          <View style={sheetStyles.fareRow}>
            <Text style={[sheetStyles.fareLabel, { fontFamily: AF.medium }]}>Rate per km</Text>
            <Text style={[sheetStyles.fareValue, { fontFamily: AF.semibold }]}>₹{selectedCab.price_per_km}</Text>
          </View>
          <View style={sheetStyles.fareRow}>
            <Text style={[sheetStyles.fareLabel, { fontFamily: AF.medium }]}>Distance</Text>
            <Text style={[sheetStyles.fareValue, { fontFamily: AF.semibold }]}>~{mockDistance} km</Text>
          </View>
          <View style={[sheetStyles.fareRow, sheetStyles.fareRowTotal]}>
            <Text style={[sheetStyles.fareLabel, { fontFamily: AF.bold }]}>Total Fare</Text>
            <Text style={[sheetStyles.fareValueTotal, { fontFamily: AF.bold }]}>
              ₹{selectedCab.price_per_km * mockDistance}
            </Text>
          </View>
        </View>

        {/* Passenger Details */}
        <Text style={[sheetStyles.sectionLabel, { fontFamily: AF.semibold }]}>Passenger Details</Text>

        <View style={sheetStyles.formGroup}>
          <BottomSheetTextInput
            style={[sheetStyles.input, { fontFamily: AF.medium }]}
            placeholder="Full Name"
            value={bName}
            editable={false}
          />

          <View style={sheetStyles.phoneContainer}>
            <View style={[sheetStyles.phoneRow, phoneError ? sheetStyles.inputError : null]}>
              <CountryPicker selected={bCountry} onSelect={setBCountry} />
              <BottomSheetTextInput
                style={[sheetStyles.phoneInput, { fontFamily: AF.medium }]}
                placeholder="Phone Number"
                placeholderTextColor="#aaa"
                value={bPhone}
                onChangeText={(text) => {
                  setBPhone(text);
                  if (phoneError) setPhoneError('');
                }}
                keyboardType="phone-pad"
              />
            </View>
            {phoneError ? (
              <View style={sheetStyles.errorRow}>
                <Ionicons name="alert-circle" size={12} color={THEME.error} />
                <Text style={[sheetStyles.errorText, { fontFamily: AF.medium }]}>{phoneError}</Text>
              </View>
            ) : null}
          </View>

          <BottomSheetTextInput
            style={[sheetStyles.input, { fontFamily: AF.medium }]}
            placeholder="Email"
            value={bEmail}
            editable={false}
          />

          <BottomSheetTextInput
            style={[sheetStyles.input, { fontFamily: AF.medium, minHeight: 44 }]}
            placeholder="Special Requests (e.g. extra luggage)"
            placeholderTextColor="#aaa"
            value={bReq}
            onChangeText={setBReq}
            maxLength={100}
          />
        </View>

        {/* Action Buttons */}
        <View style={sheetStyles.buttonRow}>
          <TouchableOpacity
            style={sheetStyles.backButton}
            onPress={() => bottomSheetRef.current?.dismiss()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color={THEME.text} />
            <Text style={[sheetStyles.backButtonText, { fontFamily: AF.medium }]}>Modify</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[sheetStyles.confirmBtn, { backgroundColor: THEME.primary }]}
            activeOpacity={0.8}
            onPress={submitBooking}
          >
            <Text style={[sheetStyles.confirmBtnText, { fontFamily: AF.bold, color: THEME.accent }]}>
              Confirm Booking
            </Text>
          </TouchableOpacity>
        </View>
        </View>
      </BottomSheetScrollView>
    );
  };

  // ── JSX ───────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <FlatList
        style={styles.listStyle}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        data={filteredCabs}
        numColumns={2}
        columnWrapperStyle={styles.listRow}
        keyExtractor={(item, index) => item.driver_id || index.toString()}
        renderItem={({ item, index }) => <CabCard item={item} index={index} onSelect={onSelectCab} />}
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.primary} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />

      {/* Fixed Booking Bottom Sheet - 90% height to show all content */}
      <BottomSheetModal
        ref={bottomSheetRef}
        enableDynamicSizing={false}
        snapPoints={sheetSnapPoints}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        enablePanDownToClose={bookingStatus !== 'loading'}
        enableContentPanningGesture={false}
        enableHandlePanningGesture={bookingStatus !== 'loading'}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior={bookingStatus === 'loading' ? 'none' : 'close'} />
        )}
      >
        <View style={sheetStyles.container}>
          {renderSheetContent()}
        </View>
      </BottomSheetModal>

      {/* Opening sheet loader */}
      {isOpeningSheet && (
        <View style={styles.globalLoader}>
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text style={[styles.loaderText, { fontFamily: AF.medium, color: THEME.primary }]}>Preparing Booking...</Text>
        </View>
      )}
    </View>
  );
}

// ── Sheet Styles ───────────────────────────────────────────────────────────────

const sheetStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.white,
  },
  formContainer: {
    flexGrow: 1,
    padding: 16,
  },
  statusContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  closeIconBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    marginTop: 20,
    fontSize: 16,
    color: THEME.textSecondary,
  },
  statusTitle: {
    marginTop: 24,
    fontSize: 24,
    letterSpacing: -0.5,
  },
  statusSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: THEME.textSecondary,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    width: '100%',
    paddingHorizontal: 20,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusBtnSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: THEME.card,
  },
  statusBtnText: {
    fontSize: 15,
  },
  statusBtnTextSecondary: {
    fontSize: 15,
  },

  // Sheet Header
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 20,
    color: THEME.text
  },
  sheetCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Journey Summary
  journeySummary: {
    backgroundColor: THEME.card,
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  journeyRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  journeyDot: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  journeyText: {
    fontSize: 14,
    color: THEME.text,
    flex: 1,
    marginLeft: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  journeyLineDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 8,
  },
  journeyLine: {
    width: 2,
    height: 20,
    backgroundColor: '#ddd',
    marginLeft: 11,
    marginVertical: 4,
  },

  // Cab Summary
  cabSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  cabImageWrap: {
    width: 60,
    height: 40,
    borderRadius: 8,
    backgroundColor: THEME.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cabImage: {
    width: '100%',
    height: '100%'
  },
  cabDetails: {
    flex: 1,
    marginLeft: 14,
  },
  cabName: {
    fontSize: 16,
    color: THEME.text,
    marginBottom: 4,
  },
  cabMeta: {
    fontSize: 13,
    color: '#666'
  },
  cabPrice: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 20,
    color: THEME.primary,
  },
  priceLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },

  // Fare Breakdown
  fareBreakdown: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  fareRowTotal: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    marginTop: 4,
    paddingTop: 8,
  },
  fareLabel: {
    fontSize: 14,
    color: '#666',
  },
  fareValue: {
    fontSize: 14,
    color: THEME.text,
  },
  fareValueTotal: {
    fontSize: 18,
    color: THEME.primary,
  },

  // Form
  sectionLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formGroup: {
    marginBottom: 10,
    gap: 8
  },
  input: {
    backgroundColor: THEME.lightGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.text,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  phoneContainer: {
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.lightGray,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  inputError: {
    borderColor: THEME.error,
    backgroundColor: '#fffcfc',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 11,
    color: THEME.error,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.text,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    paddingTop: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    gap: 6,
  },
  backButtonText: {
    fontSize: 14,
    color: THEME.text,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
  },
});

// ── Main Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.background
  },
  listStyle: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 20
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.card,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 16
  },
  headerSubtitle: {
    fontSize: 14,
    color: THEME.accent,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 28,
    color: THEME.text,
    letterSpacing: -0.5
  },

  formCard: {
    backgroundColor: THEME.white,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconWrap: {
    width: 32,
    alignItems: 'center'
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: THEME.text,
    paddingVertical: 12
  },
  formDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
    marginLeft: 32
  },

  suggestionsBox: {
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    marginVertical: 6,
    marginLeft: 32,
    overflow: 'hidden',
  },
  suggItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  suggName: {
    fontSize: 14,
    color: THEME.text
  },
  suggDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 2
  },

  filterInnerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 4,
  },
  filterInnerTitle: {
    fontSize: 14,
    color: THEME.text
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  showMoreText: {
    fontSize: 12,
    color: THEME.primary
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12
  },
  filterChip: {
    borderRadius: 16,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  filterChipImg: {
    width: '100%',
    height: 45,
    marginBottom: 4
  },
  filterChipActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  filterChipTextActive: {
    color: THEME.accent
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: THEME.text
  },
  sectionCount: {
    fontSize: 14,
    color: '#888'
  },
  viewAllLink: {
    fontSize: 14,
    color: THEME.accent,
    marginRight: 20
  },

  listRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 12
  },

  rentalContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  rentalListContent: {
    paddingLeft: 20,
    paddingRight: 8,
    gap: 16
  },
  noRentalsText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 14
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 15,
    color: '#888'
  },

  globalLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loaderText: {
    marginTop: 20,
    fontSize: 16,
    letterSpacing: 0.5
  },
});