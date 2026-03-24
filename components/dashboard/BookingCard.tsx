import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import type { Booking } from '../../types';

interface BookingCardProps {
  booking: Booking;
}

const PURPOSE_LABELS: Record<string, string> = {
  medical: '🏥 Medical Concierge',
  tourism: '🌴 Tourism Planning',
  nri:     '✈️  NRI Concierge',
  hybrid:  '🔀 Hybrid Journey',
};

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function BookingCard({ booking }: BookingCardProps) {
  return (
    <Card style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#0D3B5C', flex: 1 }}>
          {PURPOSE_LABELS[booking.purpose] ?? booking.purpose}
        </Text>
        <StatusBadge status={booking.status} />
      </View>

      {booking.condition_summary && (
        <Text style={{ fontSize: 13, color: '#475569', marginBottom: 6, lineHeight: 18 }}>
          {booking.condition_summary}
        </Text>
      )}

      <View style={{ flexDirection: 'row', gap: 20, marginTop: 8 }}>
        {booking.travel_dates_from && (
          <View>
            <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500', marginBottom: 2 }}>
              FROM
            </Text>
            <Text style={{ fontSize: 13, color: '#334155', fontWeight: '600' }}>
              {formatDate(booking.travel_dates_from)}
            </Text>
          </View>
        )}
        {booking.travel_dates_to && (
          <View>
            <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500', marginBottom: 2 }}>
              TO
            </Text>
            <Text style={{ fontSize: 13, color: '#334155', fontWeight: '600' }}>
              {formatDate(booking.travel_dates_to)}
            </Text>
          </View>
        )}
        {(booking.budget_range || booking.budget) && (
          <View>
            <Text style={{ fontSize: 11, color: '#94A3B8', fontWeight: '500', marginBottom: 2 }}>
              BUDGET
            </Text>
            <Text style={{ fontSize: 13, color: '#334155', fontWeight: '600' }}>
              {booking.budget_range ?? booking.budget}
            </Text>
          </View>
        )}
      </View>

      <Text style={{ fontSize: 11, color: '#CBD5E1', marginTop: 12 }}>
        Booking ID: {booking.id.slice(0, 8).toUpperCase()}
      </Text>
    </Card>
  );
}
