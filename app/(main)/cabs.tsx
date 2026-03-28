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
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { supabase } from '../../lib/supabase';
import { AF } from '../../lib/authTheme';
import { useAppStore } from '../../store/useAppStore';
import { router } from 'expo-router';
import { CountryPicker, COUNTRIES, Country } from '../../components/auth/CountryPicker';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

type AppPopup = {
  type: 'success' | 'error' | 'warning' | 'confirm';
  title?: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
  onCancel?: () => void;
  cancelText?: string;
};

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

// FIX: Skeleton exactly matches CabCard dimensions
const CabSkeleton = () => (
  <View style={[s.card, { maxWidth: (SCREEN_WIDTH - 56) / 2 }]}>
    <View style={s.cardImageContainer}>
      <View style={[s.skeletonPulse, { width: '100%', height: '100%' }]} />
      {/* Price tag skeleton */}
      <View style={[s.skeletonPulse, { position: 'absolute', top: 10, left: 10, width: 70, height: 26, borderRadius: 8, backgroundColor: '#305c5d' }]} />
    </View>
    <View style={s.cardInfo}>
      {/* Brand/Model line */}
      <View style={[s.skeletonLine, s.skeletonPulse, { width: '85%', height: 16, marginBottom: 6 }]} />
      {/* Rating + Driver row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 }}>
        <View style={[s.skeletonLine, s.skeletonPulse, { width: 40, height: 12 }]} />
        <View style={[s.skeletonLine, s.skeletonPulse, { width: 80, height: 12 }]} />
      </View>
      {/* Tags */}
      <View style={{ flexDirection: 'row', gap: 4 }}>
        <View style={[s.skeletonBtn, s.skeletonPulse, { width: 55, height: 18 }]} />
        <View style={[s.skeletonBtn, s.skeletonPulse, { width: 35, height: 18 }]} />
      </View>
    </View>
  </View>
);

const RentalCard = memo(({ item }: { item: Rental }) => (
  <TouchableOpacity style={s.rentalCard} activeOpacity={0.8}>
    <Image
      source={{ uri: item.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2' }}
      style={s.rentalImg}
      contentFit="cover"
    />
    <View style={s.rentalBody}>
      <Text style={[s.rentalName, { fontFamily: AF.bold }]} numberOfLines={1}>{item.name}</Text>
      <Text style={[s.rentalProp, { fontFamily: AF.medium }]}>
        {item.transmission || 'Auto'} • <Ionicons name="star" color="#dabf7e" size={12} /> {item.rating || '4.5'}
      </Text>
      <View style={s.rentalFooter}>
        <Text style={[s.rentalPrice, { fontFamily: AF.bold }]}>₹{item.price_per_day}/day</Text>
        <TouchableOpacity style={s.rentBtn} activeOpacity={0.8}>
          <Text style={[s.rentBtnText, { fontFamily: AF.bold }]}>Rent Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
));

const CabCard = memo(({ item, index, onSelect }: { item: Cab; index: number; onSelect: (cab: Cab) => void }) => (
  <Animated.View entering={FadeInDown.delay(index * 50).duration(400)} style={[s.card, { maxWidth: (SCREEN_WIDTH - 56) / 2 }]}>
    <TouchableOpacity
      style={{ flex: 1 }}
      onPress={() => onSelect(item)}
      activeOpacity={0.9}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={s.cardImageContainer}>
        <Image
          source={getVehicleImage(item.vehicle_type, item.vehicle_image)}
          style={s.cardImage}
          contentFit="contain"
        />
        <View style={s.cardPriceTag}>
          <Text style={[s.cardPriceText, { fontFamily: AF.bold }]}>₹{item.price_per_km}/km</Text>
        </View>
      </View>
      <View style={s.cardInfo}>
        <Text style={[s.cardName, { fontFamily: AF.bold }]} numberOfLines={1}>
          {item.vehicle_brand} {item.vehicle_model}
        </Text>
        <View style={s.cardMetaRow}>
          <View style={s.cardRatingBox}>
            <Ionicons name="star" size={10} color="#dabf7e" />
            <Text style={[s.cardRatingText, { fontFamily: AF.medium }]}>{item.rating}</Text>
          </View>
          <Text style={[s.cardDriverName, { fontFamily: AF.regular }]} numberOfLines={1}>
            • {item.driver_name}
          </Text>
        </View>
        <View style={s.cardTags}>
          <View style={s.smallTag}><Text style={s.smallTagText}>{item.seats} Seats</Text></View>
          {item.ac_available && <View style={s.smallTag}><Text style={s.smallTagText}>AC</Text></View>}
        </View>
      </View>
    </TouchableOpacity>
  </Animated.View>
));

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Booking form fields
  const [bName, setBName] = useState('');
  const [bPhone, setBPhone] = useState('');
  const [bEmail, setBEmail] = useState('');
  const [bPickup, setBPickup] = useState('');
  const [bDrop, setBDrop] = useState('');
  const [bReq, setBReq] = useState('');
  const [bCountry, setBCountry] = useState<Country>(COUNTRIES[0]);

  // Popup state
  const [appPopup, setAppPopup] = useState<AppPopup | null>(null);

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
    // FIX: Dismiss keyboard and clear focus immediately so first tap works
    Keyboard.dismiss();
    setPickupFocus(false);
    setDropFocus(false);

    if (!pickup.trim() || !drop.trim()) {
      setAppPopup({
        type: 'warning',
        title: 'Search Required',
        message: 'Please enter both Pickup and Drop locations to book a cab.',
        confirmText: 'Got it',
      });
      return;
    }

    if (!session?.user?.id) {
      setAppPopup({
        type: 'warning',
        title: 'Login Required',
        message: 'Please log in to book a ride.',
        onConfirm: () => router.push('/(auth)/index' as any),
        confirmText: 'Log In',
        onCancel: () => setAppPopup(null),
        cancelText: 'Cancel',
      });
      return;
    }

    if (isOpeningSheet) return;
    setIsOpeningSheet(true);
    setSelectedCab(cab);
    setMockDistance(Math.floor(Math.random() * 15) + 5);
    setBPickup(pickup);
    setBDrop(drop);

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

    setTimeout(() => {
      bottomSheetRef.current?.present();
      setIsOpeningSheet(false);
    }, 150);
  }, [pickup, drop, session, isOpeningSheet]);

  const submitBooking = useCallback(() => {
    if (!selectedCab) return;
    if (!bName || !bPhone || !bPickup || !bDrop) {
      setAppPopup({
        type: 'error',
        title: 'Missing Info',
        message: 'Please fill in all required fields.',
        confirmText: 'Dismiss',
      });
      return;
    }

    setAppPopup({
      type: 'confirm',
      title: 'Confirm Booking',
      message: `Cab: ${selectedCab.vehicle_brand} ${selectedCab.vehicle_model}\nFrom: ${bPickup}\nTo: ${bDrop}\nPhone: ${bCountry.dial}${bPhone}`,
      onConfirm: () => {
        setAppPopup(null);
        executeBooking();
      },
      confirmText: 'Confirm & Book',
      onCancel: () => setAppPopup(null),
      cancelText: 'Edit',
    });
  }, [selectedCab, bName, bPhone, bPickup, bDrop, bCountry]);

  // FIX: Handle clients table FK constraint and missing columns gracefully
  const executeBooking = async () => {
    if (!selectedCab || !session?.user?.id) return;
    setIsSubmitting(true);

    const totalFare = selectedCab.price_per_km * mockDistance;
    const bookingRef = `CAB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      // Try to upsert to clients table (required for FK constraint)
      // Using minimal fields to avoid column not found errors
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
        // If specific column error, try bare minimum insert
        if (clientError.code === 'PGRST204' || clientError.message.includes('column')) {
          const { error: insertError } = await supabase
            .from('clients')
            .insert({
              id: session.user.id,
              email: session.user.email,
              name: bName || session.user.user_metadata?.name || 'Unknown',
              phone: `${bCountry.dial}${bPhone}`,
            });

          // Ignore duplicate key errors (user already exists)
          if (insertError && !insertError.message.includes('duplicate') && !insertError.message.includes('23505')) {
            throw new Error(`Client creation failed: ${insertError.message}`);
          }
        } else {
          throw new Error(`Client creation failed: ${clientError.message}`);
        }
      }

      // Proceed with booking
      const { error: bookingError } = await supabase.from('bookings').insert({
        client_id: session.user.id,
        purpose: 'Cab Booking',
        status: 'pending',
        details: {
          booking_reference: bookingRef,
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
        },
      });

      if (bookingError) throw bookingError;

      await supabase.from('notifications').insert({
        user_id: session.user.id,
        title: 'Booking Confirmed!',
        message: `Your ${selectedCab.vehicle_brand} ${selectedCab.vehicle_model} booking is being processed. Ref: ${bookingRef}`,
        path: '/(main)/bookings',
      });

      bottomSheetRef.current?.dismiss();
      setPickup('');
      setDrop('');
      setAppPopup({
        type: 'success',
        title: 'Booking Confirmed!',
        message: `Your reference: ${bookingRef}`,
        confirmText: 'Done',
      });
    } catch (error: any) {
      const errMsg = error.message || 'Something went wrong.';
      console.error('Booking error:', error);
      setAppPopup({ type: 'error', title: 'Booking Failed', message: errMsg, confirmText: 'Dismiss' });

      await supabase.from('notifications').insert({
        user_id: session.user.id,
        title: 'Booking Failed',
        message: `Could not process your cab booking. Reason: ${errMsg}`,
        path: '/(main)/cabs',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render helpers ────────────────────────────────────────────────────────────

  const renderHeader = () => (
    <View>
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={s.headerTitleWrap}>
          <Text style={[s.headerSubtitle, { fontFamily: AF.medium }]}>Your Ride Awaits</Text>
          <Text style={[s.headerTitle, { fontFamily: AF.playfairBold }]}>Book a Cab</Text>
        </View>
      </View>

      <View style={s.formCard}>
        {/* Pickup */}
        <View style={s.inputRow}>
          <View style={s.iconWrap}><Ionicons name="location-outline" size={20} color="#305c5d" /></View>
          <TextInput
            style={[s.input, { fontFamily: AF.medium }]}
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
          <View style={s.suggestionsBox}>
            {filteredPickupLocs.map(loc => (
              <TouchableOpacity
                key={loc.id}
                style={s.suggItem}
                onPress={() => { setPickup(loc.name); setPickupFocus(false); Keyboard.dismiss(); }}
              >
                <Ionicons name="location" size={16} color="#bbb" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={[s.suggName, { fontFamily: AF.medium }]}>{loc.name}</Text>
                  <Text style={[s.suggDesc, { fontFamily: AF.regular }]}>{loc.district} • {loc.type}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={s.formDivider} />

        {/* Drop */}
        <View style={s.inputRow}>
          <View style={s.iconWrap}><Ionicons name="location" size={20} color="#f44336" /></View>
          <TextInput
            style={[s.input, { fontFamily: AF.medium }]}
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
          <View style={s.suggestionsBox}>
            {filteredDropLocs.map(loc => (
              <TouchableOpacity
                key={loc.id}
                style={s.suggItem}
                onPress={() => { setDrop(loc.name); setDropFocus(false); Keyboard.dismiss(); }}
              >
                <Ionicons name="location" size={16} color="#bbb" />
                <View style={{ marginLeft: 8 }}>
                  <Text style={[s.suggName, { fontFamily: AF.medium }]}>{loc.name}</Text>
                  <Text style={[s.suggDesc, { fontFamily: AF.regular }]}>{loc.district} • {loc.type}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Vehicle type filters */}
        <View style={s.filterInnerTitleRow}>
          <Text style={[s.filterInnerTitle, { fontFamily: AF.bold }]}>Select Vehicle Type</Text>
          <TouchableOpacity style={s.showMoreBtn} onPress={() => setShowMoreFilters(!showMoreFilters)}>
            <Text style={[s.showMoreText, { fontFamily: AF.semibold }]}>
              {showMoreFilters ? 'Show Less' : 'Show More'}
            </Text>
            <Ionicons name={showMoreFilters ? 'chevron-up' : 'chevron-down'} size={14} color="#305c5d" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <View style={s.filterGrid}>
          {FILTERS.slice(0, showMoreFilters ? FILTERS.length : 4).map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[
                s.filterChip,
                activeFilter === item.label && s.filterChipActive,
                { width: '23%', marginHorizontal: '1%', marginBottom: 16 },
              ]}
              activeOpacity={0.8}
              onPress={() => setActiveFilter(item.label)}
            >
              {item.image && <Image source={item.image} style={s.filterChipImg} contentFit="contain" />}
              <Text
                numberOfLines={1}
                style={[s.filterChipText, activeFilter === item.label && s.filterChipTextActive, { fontFamily: AF.semibold, fontSize: 10 }]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={s.sectionHeader}>
        <Text style={[s.sectionTitle, { fontFamily: AF.bold }]}>Available Cabs</Text>
        <Text style={[s.sectionCount, { fontFamily: AF.medium }]}>{filteredCabs.length} Total</Text>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 16 }}>
          {[1, 2, 3, 4].map((k) => <CabSkeleton key={k} />)}
        </View>
      );
    }
    return (
      <View style={s.emptyState}>
        <Ionicons name="car-outline" size={48} color="#ccc" />
        <Text style={[s.emptyStateText, { fontFamily: AF.medium }]}>No cabs match your filters.</Text>
      </View>
    );
  };

  const renderFooter = () => (
    <View style={s.rentalContainer}>
      <View style={s.sectionHeader}>
        <Text style={[s.sectionTitle, { fontFamily: AF.bold }]}>Self-Drive Rentals</Text>
        <TouchableOpacity onPress={() => router.push('/(main)/rentals' as any)}>
          <Text style={[s.viewAllLink, { fontFamily: AF.semibold }]}>View All</Text>
        </TouchableOpacity>
      </View>
      {rentals.length > 0 ? (
        <FlatList
          horizontal
          data={rentals}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <RentalCard item={item} />}
          contentContainerStyle={s.rentalListContent}
        />
      ) : (
        <Text style={[s.noRentalsText, { fontFamily: AF.medium }]}>No rental vehicles available.</Text>
      )}
      <View style={{ height: 120 }} />
    </View>
  );

  // ── Popup helpers ─────────────────────────────────────────────────────────────

  const popupIconName = (type: AppPopup['type']) => {
    if (type === 'success') return 'checkmark-circle';
    if (type === 'error') return 'alert-circle';
    if (type === 'warning') return 'warning';
    return 'information-circle';
  };

  const popupColor = (type: AppPopup['type']) => {
    if (type === 'success') return '#4CAF50';
    if (type === 'error') return '#f44336';
    if (type === 'warning') return '#ff9800';
    return '#305c5d';
  };

  // ── JSX ───────────────────────────────────────────────────────────────────────

  return (
    <View style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <FlatList
        style={s.listStyle}
        contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + 20 }]}
        data={filteredCabs}
        numColumns={2}
        columnWrapperStyle={s.listRow}
        keyExtractor={(item, index) => item.driver_id || index.toString()}
        renderItem={({ item, index }) => <CabCard item={item} index={index} onSelect={onSelectCab} />}
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#305c5d" />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />

      {/* Booking Bottom Sheet */}
      <BottomSheetModal
        ref={bottomSheetRef}
        enableDynamicSizing={false}
        snapPoints={['85%', '95%']}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" />
        )}
      >
        {selectedCab && (
          <BottomSheetScrollView
            contentContainerStyle={s.sheetContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={s.sheetHeader}>
              <Text style={[s.sheetTitle, { fontFamily: AF.bold }]}>Complete Booking</Text>
              <TouchableOpacity onPress={() => bottomSheetRef.current?.dismiss()} style={s.sheetCloseBtn}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Journey Summary - Compact */}
            <View style={s.journeySummary}>
              <View style={s.journeyRow}>
                <Ionicons name="location-outline" size={16} color="#305c5d" />
                <Text style={[s.journeyText, { fontFamily: AF.medium }]} numberOfLines={1}>{bPickup}</Text>
              </View>
              <View style={s.journeyLine} />
              <View style={s.journeyRow}>
                <Ionicons name="location" size={16} color="#f44336" />
                <Text style={[s.journeyText, { fontFamily: AF.medium }]} numberOfLines={1}>{bDrop}</Text>
              </View>
              <View style={s.journeyMeta}>
                <Text style={[s.journeyMetaText, { fontFamily: AF.medium }]}>
                  <Ionicons name="calendar-outline" size={12} />{' '}
                  {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} •{' '}
                  <Ionicons name="time-outline" size={12} />{' '}
                  {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>

            {/* Cab summary - Compact */}
            <View style={s.sheetCabReview}>
              <View style={s.sheetCabImgWrap}>
                <Image
                  source={getVehicleImage(selectedCab.vehicle_type, selectedCab.vehicle_image)}
                  style={s.sheetCabImg}
                  contentFit="contain"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[s.sheetCabName, { fontFamily: AF.bold }]}>
                  {selectedCab.vehicle_brand} {selectedCab.vehicle_model}
                </Text>
                <Text style={{ fontFamily: AF.medium, color: '#666', fontSize: 13, marginTop: 2 }}>
                  {selectedCab.driver_name} • {selectedCab.rating}★ • {selectedCab.seats} Seats
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[s.fareValTotal, { fontFamily: AF.bold, fontSize: 16 }]}>
                  ₹{selectedCab.price_per_km * mockDistance}
                </Text>
                <Text style={{ fontSize: 11, color: '#888', fontFamily: AF.medium }}>Total Fare</Text>
              </View>
            </View>

            {/* Fare Details - Compact horizontal layout */}
            <View style={s.fareBoxHorizontal}>
              <View style={s.fareCol}>
                <Text style={[s.fareLabel, { fontFamily: AF.medium }]}>Rate</Text>
                <Text style={[s.fareVal, { fontFamily: AF.semibold }]}>₹{selectedCab.price_per_km}/km</Text>
              </View>
              <View style={s.fareDividerVertical} />
              <View style={s.fareCol}>
                <Text style={[s.fareLabel, { fontFamily: AF.medium }]}>Distance</Text>
                <Text style={[s.fareVal, { fontFamily: AF.semibold }]}>~{mockDistance} km</Text>
              </View>
              <View style={s.fareDividerVertical} />
              <View style={s.fareCol}>
                <Text style={[s.fareLabel, { fontFamily: AF.medium }]}>Total</Text>
                <Text style={[s.fareVal, { fontFamily: AF.bold, color: '#305c5d' }]}>
                  ₹{selectedCab.price_per_km * mockDistance}
                </Text>
              </View>
            </View>

            {/* Passenger Details - Compact */}
            <Text style={[s.formSectionTitle, { fontFamily: AF.semibold }]}>Passenger Details</Text>

            <View style={s.sheetFormGroup}>
              <BottomSheetTextInput
                style={[s.sheetInput, { fontFamily: AF.medium, backgroundColor: '#f5f5f5', color: '#888', height: 44 }]}
                placeholder="Full Name"
                value={bName}
                editable={false}
              />

              {/* Phone input with CountryPicker */}
              <View style={s.phoneInputWrapper}>
                <CountryPicker selected={bCountry} onSelect={setBCountry} />
                <BottomSheetTextInput
                  style={[s.sheetInputPhone, { fontFamily: AF.medium, height: 44 }]}
                  placeholder="Phone Number"
                  placeholderTextColor="#aaa"
                  value={bPhone}
                  onChangeText={setBPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <BottomSheetTextInput
                style={[s.sheetInput, { fontFamily: AF.medium, backgroundColor: '#f5f5f5', color: '#888', height: 44 }]}
                placeholder="Email"
                value={bEmail}
                editable={false}
              />

              <BottomSheetTextInput
                style={[s.sheetInput, s.sheetInputMulti, { fontFamily: AF.medium, height: 60 }]}
                placeholder="Special Request (optional)"
                placeholderTextColor="#aaa"
                value={bReq}
                onChangeText={setBReq}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Confirm Button */}
            <View style={[s.sheetFooter, { borderTopWidth: 0, paddingBottom: 0, marginTop: 10 }]}>
              <TouchableOpacity
                style={s.confirmBtn}
                activeOpacity={0.8}
                onPress={submitBooking}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={[s.confirmBtnText, { fontFamily: AF.bold }]}>Confirm Booking (Pay Later)</Text>
                }
              </TouchableOpacity>
            </View>

            {/* Gap below to prevent cutoff */}
            <View style={{ height: 40 }} />
          </BottomSheetScrollView>
        )}
      </BottomSheetModal>

      {/* Opening sheet loader */}
      {isOpeningSheet && (
        <View style={s.globalLoader}>
          <ActivityIndicator size="large" color="#305c5d" />
          <Text style={[s.loaderText, { fontFamily: AF.medium }]}>Preparing Booking...</Text>
        </View>
      )}

      {/* Global popup modal */}
      {appPopup && (
        <Modal transparent visible animationType="fade" statusBarTranslucent>
          <View style={s.modalOverlay}>
            <View style={[s.modalCard, { borderColor: popupColor(appPopup.type) }]}>
              <TouchableOpacity
                style={s.modalClose}
                onPress={() => { appPopup.onCancel?.(); setAppPopup(null); }}
              >
                <Ionicons name="close" size={22} color="#aaa" />
              </TouchableOpacity>

              <View style={[s.modalIcon, { backgroundColor: `${popupColor(appPopup.type)}18` }]}>
                <Ionicons name={popupIconName(appPopup.type)} size={36} color={popupColor(appPopup.type)} />
              </View>

              {appPopup.title && (
                <Text style={[s.modalTitleText, { fontFamily: AF.bold }]}>{appPopup.title}</Text>
              )}
              <Text style={[s.modalText, { fontFamily: AF.medium }]}>{appPopup.message}</Text>

              <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                {appPopup.onCancel && (
                  <TouchableOpacity
                    style={[s.modalBtn, s.modalBtnCancel, { flex: 1 }]}
                    onPress={() => { appPopup.onCancel!(); setAppPopup(null); }}
                  >
                    <Text style={[s.modalBtnText, { color: '#333', fontFamily: AF.medium }]}>
                      {appPopup.cancelText || 'Cancel'}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    s.modalBtn,
                    appPopup.onCancel ? { flex: 1.5 } : { width: '100%' },
                    { backgroundColor: popupColor(appPopup.type) },
                  ]}
                  onPress={() => {
                    if (appPopup.onConfirm) appPopup.onConfirm();
                    else setAppPopup(null);
                  }}
                >
                  <Text style={[s.modalBtnText, { fontFamily: AF.bold }]}>
                    {appPopup.confirmText || 'OK'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ede6df' },
  listStyle: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

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
    backgroundColor: '#fbf6f4',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  headerTitleWrap: { flex: 1, marginLeft: 16 },
  headerSubtitle: {
    fontSize: 14,
    color: '#dabf7e',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: { fontSize: 28, color: '#000', letterSpacing: -0.5 },

  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 32, alignItems: 'center' },
  input: { flex: 1, fontSize: 15, color: '#000', paddingVertical: 12 },
  formDivider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 4, marginLeft: 32 },

  suggestionsBox: {
    backgroundColor: '#fff',
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
  suggName: { fontSize: 14, color: '#000' },
  suggDesc: { fontSize: 12, color: '#888', marginTop: 2 },

  filterInnerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 4,
  },
  filterInnerTitle: { fontSize: 14, color: '#000' },
  showMoreBtn: { flexDirection: 'row', alignItems: 'center' },
  showMoreText: { fontSize: 12, color: '#305c5d' },
  filterGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  filterChip: {
    borderRadius: 16,
    backgroundColor: '#fbf6f4',
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  filterChipImg: { width: '100%', height: 45, marginBottom: 4 },
  filterChipActive: { backgroundColor: '#305c5d', borderColor: '#305c5d' },
  filterChipText: { fontSize: 12, color: '#666', textAlign: 'center' },
  filterChipTextActive: { color: '#dabf7e' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, color: '#000' },
  sectionCount: { fontSize: 14, color: '#888' },
  viewAllLink: { fontSize: 14, color: '#dabf7e', marginRight: 20 },

  listRow: { justifyContent: 'space-between', paddingHorizontal: 20, gap: 16 },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardImageContainer: {
    width: '100%',
    aspectRatio: 1.66,
    backgroundColor: '#fbf6f4',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    position: 'relative',
  },
  cardImage: { width: '100%', height: '100%' },
  cardPriceTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#305c5d',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  cardPriceText: { color: '#dabf7e', fontSize: 11 },
  cardInfo: { padding: 10 },
  cardName: { fontSize: 14, color: '#000', marginBottom: 4 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardRatingBox: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  cardRatingText: { fontSize: 11, color: '#666' },
  cardDriverName: { fontSize: 11, color: '#888', marginLeft: 4, flex: 1 },
  cardTags: { flexDirection: 'row', gap: 4 },
  smallTag: {
    backgroundColor: 'rgba(218, 191, 126, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  smallTagText: { fontSize: 9, fontFamily: 'medium', color: '#305c5d' },

  rentalContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  rentalListContent: { paddingLeft: 20, paddingRight: 8, gap: 16 },
  rentalCard: {
    width: 200,
    backgroundColor: '#fbf6f4',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fff',
    marginRight: 16,
  },
  rentalImg: { width: '100%', height: 120, backgroundColor: '#ede6df' },
  rentalBody: { padding: 12 },
  rentalName: { fontSize: 16, color: '#000', marginBottom: 4 },
  rentalProp: { fontSize: 13, color: '#666', marginBottom: 12 },
  rentalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rentalPrice: { fontSize: 14, color: '#305c5d' },
  rentBtn: { backgroundColor: '#dabf7e', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  rentBtnText: { color: '#fff', fontSize: 12 },
  noRentalsText: { textAlign: 'center', color: '#888', marginTop: 20, fontSize: 14 },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStateText: { marginTop: 12, fontSize: 15, color: '#888' },

  // Skeletons - Exact match to card
  skeletonPulse: {
    backgroundColor: '#e6dfd8',
    overflow: 'hidden',
  },
  skeletonLine: { borderRadius: 6 },
  skeletonBtn: { borderRadius: 4 },

  // Bottom Sheet - Compact UX
  sheetContent: {
    padding: 16,
    paddingBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sheetTitle: { fontSize: 18, color: '#000' },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sticky footer for button
  sheetFooter: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  journeySummary: {
    backgroundColor: '#fbf6f4',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12
  },
  journeyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  journeyText: { fontSize: 13, color: '#000', flex: 1 },
  journeyLine: { width: 1, height: 10, backgroundColor: '#ccc', marginLeft: 7.5, marginVertical: 2 },
  journeyMeta: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  journeyMetaText: { fontSize: 12, color: '#666' },

  sheetCabReview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  sheetCabImgWrap: {
    width: 60,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fbf6f4',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sheetCabImg: { width: '100%', height: '100%' },
  sheetCabName: { fontSize: 14, color: '#000' },

  // Horizontal fare layout
  fareBoxHorizontal: {
    flexDirection: 'row',
    backgroundColor: '#fbf6f4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fareCol: {
    flex: 1,
    alignItems: 'center',
  },
  fareDividerVertical: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 8,
  },
  fareLabel: { fontSize: 12, color: '#666' },
  fareVal: { fontSize: 12, color: '#000' },
  fareValTotal: { fontSize: 18, color: '#305c5d' },

  formSectionTitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sheetFormGroup: { marginBottom: 8, gap: 8 },
  sheetInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: '#eee',
  },
  sheetInputMulti: {
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  // Phone input with fixed height wrapper
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    minHeight: 44,
    overflow: 'hidden',
  },
  sheetInputPhone: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: 'transparent',
  },

  confirmBtn: {
    backgroundColor: '#305c5d',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#fff', fontSize: 15 },

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
  loaderText: { marginTop: 20, fontSize: 16, color: '#305c5d', letterSpacing: 0.5 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitleText: { fontSize: 20, color: '#000', marginBottom: 12, textAlign: 'center' },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalBtn: { paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  modalBtnText: { color: '#fff', fontSize: 16 },
  modalBtnCancel: { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#e0e0e0' },
});