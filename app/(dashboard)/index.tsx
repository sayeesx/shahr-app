import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl, FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { useDashboard } from '../../hooks/useDashboard';
import { BookingCard } from '../../components/dashboard/BookingCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SkeletonCard } from '../../components/ui/SkeletonLoader';
import { Card } from '../../components/ui/Card';
import type { CabBooking, RentalBooking } from '../../types';

export default function DashboardScreen() {
  const session = useAppStore((s) => s.session);
  const clearSession = useAppStore((s) => s.clearSession);
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAFAF8', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Ionicons name="person-outline" size={48} color="#CBD5E1" />
        <Text style={{ color: '#0D3B5C', fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 }}>
          No session found
        </Text>
        <Text style={{ color: '#64748B', textAlign: 'center', marginBottom: 24 }}>
          Submit an intake request to view your dashboard.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(main)')}
          style={{ backgroundColor: '#0D3B5C', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28 }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAF8' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#0D3B5C', paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#94B8D0', fontSize: 12, fontWeight: '600', letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase' }}>
              Welcome back
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>
              {session.name.split(' ')[0]}
            </Text>
          </View>
          <TouchableOpacity
            onPress={async () => {
              await clearSession();
              router.replace('/(main)');
            }}
            style={{ padding: 8 }}
          >
            <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>

        {/* Quick stats */}
        {data?.booking && (
          <View style={{
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: 14, padding: 16,
            flexDirection: 'row', justifyContent: 'space-between',
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>
                {data.statuses.length}
              </Text>
              <Text style={{ color: '#94B8D0', fontSize: 11, marginTop: 2 }}>Updates</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.15)' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>
                {data.cabBookings.length}
              </Text>
              <Text style={{ color: '#94B8D0', fontSize: 11, marginTop: 2 }}>Cabs</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.15)' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>
                {data.rentalBookings.length}
              </Text>
              <Text style={{ color: '#94B8D0', fontSize: 11, marginTop: 2 }}>Rentals</Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor="#0D3B5C" />
        }
      >
        {isLoading ? (
          <>
            <SkeletonCard style={{ marginBottom: 14 }} />
            <SkeletonCard style={{ marginBottom: 14 }} />
          </>
        ) : isError ? (
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Ionicons name="cloud-offline-outline" size={40} color="#CBD5E1" />
            <Text style={{ color: '#64748B', marginTop: 12, textAlign: 'center' }}>
              Failed to load dashboard. Pull to refresh.
            </Text>
          </View>
        ) : !data?.booking ? (
          /* No booking yet — not an error */
          <View style={{ alignItems: 'center', padding: 32 }}>
            <View style={{ width: 72, height: 72, backgroundColor: '#F0F9F8', borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ionicons name="hourglass-outline" size={32} color="#2ba89a" />
            </View>
            <Text style={{ color: '#0D3B5C', fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
              Your plan is being prepared
            </Text>
            <Text style={{ color: '#64748B', textAlign: 'center', lineHeight: 20 }}>
              Our AI concierge is working on your personalised itinerary. Check back soon.
            </Text>
          </View>
        ) : (
          <>
            {/* ── Plan Summary ──────────────────────────────────────────────── */}
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#2ba89a', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
              Your Plan
            </Text>
            <BookingCard booking={data.booking} />

            {/* ── Status Timeline ───────────────────────────────────────────── */}
            {data.statuses.length > 0 && (
              <>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#2ba89a', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, marginTop: 8 }}>
                  Status Timeline
                </Text>
                {data.statuses.map((s, i) => (
                  <Card key={i} style={{ marginBottom: 10, flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
                    <View style={{ width: 36, height: 36, backgroundColor: '#F0F9F8', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="time-outline" size={18} color="#2ba89a" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <StatusBadge status={s.status} />
                        <Text style={{ fontSize: 11, color: '#94A3B8' }}>
                          {new Date(s.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </Text>
                      </View>
                      {s.notes && <Text style={{ fontSize: 13, color: '#475569', lineHeight: 18, marginTop: 4 }}>{s.notes}</Text>}
                    </View>
                  </Card>
                ))}
              </>
            )}

            {/* ── Cab Bookings ──────────────────────────────────────────────── */}
            {data.cabBookings.length > 0 && (
              <>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#2ba89a', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, marginTop: 8 }}>
                  Transport
                </Text>
                {data.cabBookings.map((cab: CabBooking, i) => (
                  <Card key={i} style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 12 }}>
                      <View style={{ width: 40, height: 40, backgroundColor: '#F0F9F8', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="car-outline" size={20} color="#0D3B5C" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: '#0D3B5C' }}>
                          {cab.driver?.name ?? 'Driver Assigned'}
                        </Text>
                        {cab.vehicle && (
                          <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                            {cab.vehicle.make} {cab.vehicle.model} · {cab.vehicle.plate_number}
                          </Text>
                        )}
                      </View>
                      <StatusBadge status={cab.status} />
                    </View>
                    {cab.pickup_location && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons name="location-outline" size={14} color="#94A3B8" />
                        <Text style={{ fontSize: 13, color: '#64748B' }}>{cab.pickup_location}</Text>
                        <Ionicons name="arrow-forward" size={12} color="#CBD5E1" />
                        <Text style={{ fontSize: 13, color: '#64748B' }}>{cab.dropoff_location}</Text>
                      </View>
                    )}
                    {cab.driver?.phone && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                        <Ionicons name="call-outline" size={14} color="#2ba89a" />
                        <Text style={{ fontSize: 13, color: '#2ba89a', fontWeight: '600' }}>{cab.driver.phone}</Text>
                      </View>
                    )}
                  </Card>
                ))}
              </>
            )}

            {/* ── Rental Vehicles ───────────────────────────────────────────── */}
            {data.rentalBookings.length > 0 && (
              <>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#2ba89a', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, marginTop: 8 }}>
                  Rental Vehicles
                </Text>
                {data.rentalBookings.map((rental: RentalBooking, i) => (
                  <Card key={i} style={{ marginBottom: 12, flexDirection: 'row', gap: 14, alignItems: 'center' }}>
                    <View style={{ width: 44, height: 44, backgroundColor: '#EEF2FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="bicycle-outline" size={22} color="#8B5CF6" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#0D3B5C' }}>
                        {rental.rental_vehicle?.name ?? 'Vehicle'}
                      </Text>
                      <Text style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                        {rental.start_date ? `${rental.start_date} → ${rental.end_date}` : 'Dates TBD'}
                      </Text>
                    </View>
                    <StatusBadge status={rental.status} />
                  </Card>
                ))}
              </>
            )}

            {/* ── Action Buttons ────────────────────────────────────────────── */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#F0F9F8', borderRadius: 14, padding: 16, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#D1F5F0' }}
                onPress={() => {}}
              >
                <Ionicons name="chatbubble-outline" size={22} color="#2ba89a" />
                <Text style={{ color: '#2ba89a', fontSize: 13, fontWeight: '700' }}>Chat</Text>
                <Text style={{ color: '#94A3B8', fontSize: 11 }}>Coming soon</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#F8F5F0', borderRadius: 14, padding: 16, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#E8DDD0' }}
                onPress={() => {}}
              >
                <Ionicons name="download-outline" size={22} color="#D97706" />
                <Text style={{ color: '#D97706', fontSize: 13, fontWeight: '700' }}>Download</Text>
                <Text style={{ color: '#94A3B8', fontSize: 11 }}>PDF Plan</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
