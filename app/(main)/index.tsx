import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Easing,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useFocusEffect } from 'expo-router';

import { useAppStore } from '../../store/useAppStore';
import { AF } from '../../lib/authTheme';

import { QuickAccessCard } from '../../components/ui/QuickAccessCard';
import { PackageCard, PackageCardData } from '../../components/ui/PackageCard';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { SkeletonCard } from '../../components/ui/SkeletonCard';

// ── Mock Data ─────────────────────────────────────────────────────────────────

const PACKAGES: PackageCardData[] = [
  { id: '1', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400', title: 'Alleppey Houseboat Escape', price: '₹12,500', duration: '3 Days', rating: 5 },
  { id: '2', image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=400', title: 'Munnar Tea Garden Trek', price: '₹8,900', duration: '2 Days', rating: 4 },
  { id: '3', image: 'https://images.unsplash.com/photo-1571721795195-a2ca2d3370a9?w=400', title: 'Thekkady Spice Trail', price: '₹7,200', duration: '2 Days', rating: 4 },
  { id: '4', image: 'https://images.unsplash.com/photo-1622308644420-b20142dc993c?w=400', title: 'Kovalam Beach Retreat', price: '₹15,000', duration: '4 Days', rating: 5 },
];

const CHIPS = ['Houseboat', 'Ayurveda', 'Trekking', 'Beach', 'Luxury', 'Wildlife'];

const QUICK_ACTIONS = [
  {
    label: 'Book Your Tour',
    icon: 'bus-outline' as const,
    route: '/(main)/packages',
    images: [
      require('../../assets/home-images/tour/1.webp'),
      require('../../assets/home-images/tour/2.webp'),
      require('../../assets/home-images/tour/3.webp'),
      require('../../assets/home-images/tour/4.webp'),
      require('../../assets/home-images/tour/5.webp'),
      require('../../assets/home-images/tour/6.webp'),
    ]
  },
  {
    label: 'Medical Visit',
    icon: 'medkit-outline' as const,
    route: '/(main)/medical',
    images: [
      require('../../assets/home-images/medical/1.webp'),
      require('../../assets/home-images/medical/2.webp'),
      require('../../assets/home-images/medical/3.webp'),
    ]
  },
  { label: 'NRI Concierge', icon: 'people-outline' as const, route: '/(main)/nri' },
  { label: 'AI Trip Planner', icon: 'sparkles-outline' as const, route: '/(main)/ai-planner' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const session = useAppStore((s) => s.session);
  const firstName = session?.user?.user_metadata?.name?.split(' ')?.[0] || 'Traveller';
  const [activeChip, setActiveChip] = useState(0);

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const r1 = React.useRef(new Animated.Value(0)).current;
  const r2 = React.useRef(new Animated.Value(0)).current;
  const r3 = React.useRef(new Animated.Value(0)).current;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (session?.user?.id) {
        fetchNotifications();
      }
    }, [session?.user?.id])
  );

  const fetchNotifications = async () => {
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (data && !error) {
        setNotifications(data);
      }
    } catch (e) {
      console.log('Error fetching notifications:', e);
    }
  };

  // Realtime subscription
  React.useEffect(() => {
    if (!session?.user?.id) return;

    fetchNotifications();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]);

  const hasNotifications = notifications.length > 0 && notifications.some(n => !n.is_read);

  // Ripple effect (Radar rings)
  useFocusEffect(
    React.useCallback(() => {
      if (hasNotifications) {
        r1.setValue(0);
        r2.setValue(0);
        r3.setValue(0);

        const createRipple = (anim: Animated.Value, delay: number) => {
          return Animated.sequence([
            Animated.delay(delay),
            Animated.loop(
              Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 2400, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true })
              ])
            )
          ]);
        };

        Animated.parallel([
          createRipple(r1, 0),
          createRipple(r2, 800),
          createRipple(r3, 1600),
        ]).start();
      }

      return () => {
        r1.stopAnimation();
        r2.stopAnimation();
        r3.stopAnimation();
      };
    }, [hasNotifications])
  );

  const openDrawer = async () => {
    setIsDrawerOpen(true);

    // Auto-mark all messages as seen
    const unreadNotifications = notifications.filter(n => !n.is_read);
    if (unreadNotifications.length > 0 && session?.user?.id) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', session.user.id)
          .eq('is_read', false);

        if (!error) {
          setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
      } catch (e) {
        console.error('Error marking notifications as read:', e);
      }
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setExpandedId(null);
  };

  const handleNotificationPress = async (notification: any) => {
    if (expandedId !== notification.id) {
      setExpandedId(notification.id);
    } else {
      if (notification.path) {
        closeDrawer();
        if (notification.path.startsWith('http')) {
          Linking.openURL(notification.path);
        } else {
          router.push(notification.path);
        }
      } else {
        setExpandedId(null);
      }
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderPackage = useCallback(({ item }: { item: PackageCardData }) => (
    <PackageCard
      {...item}
      variant="horizontal"
      onPress={() => { }}
    />
  ), []);

  return (
    <View style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scrollContent, { paddingTop: insets.top, paddingBottom: 90 }]}
      >
        {/* ── Top Bar ── */}
        <View style={s.topBar}>
          <View style={{ flex: 1, marginRight: 16 }}>
            {/* Greeting: DM Sans for the phrase (Black), Playfair Display for the user name (Yellow) */}
            <Text style={[s.greeting, { fontFamily: AF.medium, color: '#000000' }]} numberOfLines={1} adjustsFontSizeToFit={true}>
              {getGreeting()},{' '}
              <Text style={{ fontFamily: AF.playfairBold, color: '#dabf7e' }}>{firstName}</Text>
            </Text>
          </View>

          <TouchableOpacity style={s.bellBtn} activeOpacity={0.8} onPress={openDrawer}>
            {hasNotifications && (
              <>
                <Animated.View style={[s.rippleEffect, {
                  opacity: r1.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                  transform: [{ scale: r1.interpolate({ inputRange: [0, 1], outputRange: [1, 3] }) }]
                }]} />
                <Animated.View style={[s.rippleEffect, {
                  opacity: r2.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                  transform: [{ scale: r2.interpolate({ inputRange: [0, 1], outputRange: [1, 3] }) }]
                }]} />
                <Animated.View style={[s.rippleEffect, {
                  opacity: r3.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                  transform: [{ scale: r3.interpolate({ inputRange: [0, 1], outputRange: [1, 3] }) }]
                }]} />
              </>
            )}
            <Ionicons name="notifications-outline" size={22} color="#000000" />
            {hasNotifications && <View style={s.badge} />}
          </TouchableOpacity>
        </View>

        {/* ── Quick Access Grid ── */}
        <View style={s.grid}>
          <View style={s.gridRow}>
            {QUICK_ACTIONS.slice(0, 2).map((item, i) => (
              <QuickAccessCard
                key={item.label}
                label={item.label}
                iconName={item.icon}
                isActive={i === 0}
                images={(item as any).images}
                onPress={() => router.push(item.route as any)}
              />
            ))}
          </View>
          <View style={s.gridRow}>
            {QUICK_ACTIONS.slice(2, 4).map((item) => (
              <QuickAccessCard
                key={item.label}
                label={item.label}
                iconName={item.icon}
                isActive={false}
                images={(item as any).images}
                onPress={() => router.push(item.route as any)}
                halfHeight={true}
              />
            ))}
          </View>
        </View>

        {/* ── Travel Packages ── */}
        <SectionTitle title="Travel Packages" ctaLabel="See All" onCta={() => { }} />
        <FlatList
          data={PACKAGES}
          renderItem={renderPackage}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.hList}
          initialNumToRender={4}
          removeClippedSubviews
          snapToInterval={192}
          decelerationRate="fast"
        />

        {/* ── Other Services ── */}
        <SectionTitle title="Other Services" ctaLabel="See All" onCta={() => router.push('/(main)/other-services' as any)} />
        <View style={s.otherServicesRow}>
          <TouchableOpacity style={s.serviceBtn} onPress={() => router.push('/(main)/cabs' as any)} activeOpacity={0.8}>
            <View style={s.serviceIconCircle}>
              <Ionicons name="car-outline" size={28} color="#dabf7e" />
            </View>
            <Text style={[s.serviceLabel, { fontFamily: AF.medium }]} numberOfLines={2}>Cabs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.serviceBtn} onPress={() => router.push('/(main)/hotels' as any)} activeOpacity={0.8}>
            <View style={s.serviceIconCircle}>
              <Ionicons name="bed-outline" size={28} color="#dabf7e" />
            </View>
            <Text style={[s.serviceLabel, { fontFamily: AF.medium }]} numberOfLines={2}>Hotels</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.serviceBtn} onPress={() => router.push('/(main)/visa' as any)} activeOpacity={0.8}>
            <View style={s.serviceIconCircle}>
              <Ionicons name="document-text-outline" size={28} color="#dabf7e" />
            </View>
            <Text style={[s.serviceLabel, { fontFamily: AF.medium }]} numberOfLines={2}>Visa Guidance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.serviceBtn} onPress={() => router.push('/(main)/pickup' as any)} activeOpacity={0.8}>
            <View style={s.serviceIconCircle}>
              <Ionicons name="airplane-outline" size={28} color="#dabf7e" />
            </View>
            <Text style={[s.serviceLabel, { fontFamily: AF.medium }]} numberOfLines={2}>Airport Pickup</Text>
          </TouchableOpacity>
        </View>

        {/* ── Trending Chips ── */}
        <SectionTitle title="Trending Experiences" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chips}
        >
          {CHIPS.map((chip, i) => (
            <TouchableOpacity
              key={chip}
              style={[s.chip, activeChip === i && s.chipActive]}
              onPress={() => setActiveChip(i)}
              activeOpacity={0.8}
            >
              <Text style={[s.chipLabel, activeChip === i && s.chipLabelActive, { fontFamily: AF.semibold }]}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Second Packages Row (Trending) ── */}
        <FlatList
          data={[...PACKAGES].reverse()}
          renderItem={renderPackage}
          keyExtractor={(item) => `t-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.hList}
          initialNumToRender={4}
          removeClippedSubviews
          snapToInterval={192}
          decelerationRate="fast"
          style={{ marginTop: 4 }}
        />

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Notifications Drawer Overlay */}
      <Modal visible={isDrawerOpen} transparent animationType="slide">
        <View style={s.sheetOverlay}>
          <TouchableOpacity style={s.sheetCloseArea} activeOpacity={1} onPress={closeDrawer} />
          <View style={s.sheetContent}>
            <View style={s.sheetHandle} />
            <View style={s.drawerHeader}>
              <Text style={[s.drawerTitle, { fontFamily: AF.bold }]}>Notifications</Text>
              <TouchableOpacity onPress={closeDrawer} style={s.closeBtn}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={s.drawerList}
              ListEmptyComponent={
                <View style={s.emptyNotifications}>
                  <Ionicons name="notifications-off-outline" size={48} color="#ccc" />
                  <Text style={[s.emptyText, { fontFamily: AF.medium }]}>No notifications yet.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[s.notificationItem, !item.is_read && s.notificationUnread]}
                  onPress={() => handleNotificationPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={s.notifIconWrap}>
                    <Ionicons name="mail" size={20} color="#305c5d" />
                  </View>
                  <View style={s.notifTextWrap}>
                    <Text style={[s.notifTitle, { fontFamily: AF.bold }]}>{item.title}</Text>
                    <Text
                      style={[s.notifBody, { fontFamily: AF.medium }]}
                      numberOfLines={expandedId === item.id ? undefined : 2}
                    >
                      {item.message}
                    </Text>
                  </View>
                  {!item.is_read && expandedId !== item.id && <View style={s.notifDot} />}
                  {expandedId === item.id && item.path && (
                    <View style={s.notifActionArrow}>
                      <Ionicons name="return-down-forward-outline" size={20} color="#305c5d" />
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ede6df' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 32,
    color: '#dabf7e',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 22,
    color: '#000000',
    letterSpacing: -0.5,
  },

  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#efe8e1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddbe75',
  },
  badge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    borderWidth: 1.5,
    borderColor: '#fbf6f4',
  },

  // Quick Access Grid — full-width, padded
  grid: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 28,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },

  // Horizontal lists — left padding 20, last card gets right padding via separator
  hList: {
    paddingLeft: 20,
    paddingRight: 8,
    marginBottom: 24,
  },

  // Other Services
  otherServicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  serviceBtn: {
    alignItems: 'center',
    width: 72,
  },
  serviceIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#305c5d',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceLabel: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Chips
  chips: {
    paddingLeft: 20,
    paddingRight: 8,
    paddingBottom: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: '#fbf6f4',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#305c5d',
  },
  chipLabel: {
    fontSize: 13,
    color: '#dabf7e',
  },

  chipLabelActive: {
    color: '#dabf7e',
  },

  // Sheet
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetCloseArea: {
    flex: 1,
  },
  sheetContent: {
    width: '100%',
    height: '92%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#ddd',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  drawerTitle: {
    fontSize: 20,
    color: '#333',
  },
  closeBtn: {
    padding: 4,
  },
  drawerList: {
    paddingBottom: 20,
  },
  emptyNotifications: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#888',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
    backgroundColor: '#fff',
  },
  notificationUnread: {
    backgroundColor: '#fbf6f4',
  },
  notifIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ede6df',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notifTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  notifTitle: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  notifBody: {
    fontSize: 13,
    color: '#666',
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    alignSelf: 'center',
    marginLeft: 8,
  },
  notifActionArrow: {
    alignSelf: 'center',
    marginLeft: 12,
    marginRight: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ede6df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleEffect: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ddbe75',
    backgroundColor: 'transparent',
    top: 0,
    left: 0,
  },
});
