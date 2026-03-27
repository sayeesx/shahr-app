import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AF } from '../../lib/authTheme';


interface SectionTitleProps {
  title: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export const SectionTitle = React.memo(({ title, ctaLabel, onCta }: SectionTitleProps) => (
  <View style={s.row}>
    <Text style={[s.title, { fontFamily: AF.bold }]}>{title}</Text>
    {ctaLabel && (
      <TouchableOpacity onPress={onCta} activeOpacity={0.7}>
        <Text style={[s.cta, { fontFamily: AF.semibold }]}>{ctaLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
));

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    color: '#000000',
    letterSpacing: -0.3,
  },
  cta: {
    fontSize: 13,
    color: '#305c5d',
  },
});
