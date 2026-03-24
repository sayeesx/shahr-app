import React from 'react';
import { View, Text, type StyleProp, type ViewStyle } from 'react-native';
import type { BookingStatusType } from '../../types';

type BadgeVariant = BookingStatusType | 'available' | 'unavailable';

const BADGE_STYLES: Record<BadgeVariant, { bg: string; text: string; label: string }> = {
  pending:     { bg: '#FEF3C7', text: '#92400E', label: 'Pending' },
  confirmed:   { bg: '#D1FAE5', text: '#065F46', label: 'Confirmed' },
  in_progress: { bg: '#DBEAFE', text: '#1E40AF', label: 'In Progress' },
  completed:   { bg: '#E0E7FF', text: '#3730A3', label: 'Completed' },
  cancelled:   { bg: '#FEE2E2', text: '#991B1B', label: 'Cancelled' },
  available:   { bg: '#D1FAE5', text: '#065F46', label: 'Available' },
  unavailable: { bg: '#F3F4F6', text: '#6B7280', label: 'Unavailable' },
};

interface StatusBadgeProps {
  status: BadgeVariant;
  style?: StyleProp<ViewStyle>;
}

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const config = BADGE_STYLES[status] ?? BADGE_STYLES.pending;

  return (
    <View
      style={[
        {
          backgroundColor: config.bg,
          borderRadius: 99,
          paddingHorizontal: 10,
          paddingVertical: 4,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text style={{ color: config.text, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 }}>
        {config.label}
      </Text>
    </View>
  );
}
