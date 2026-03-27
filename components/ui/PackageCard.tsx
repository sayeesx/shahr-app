import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AF } from '../../lib/authTheme';



export interface PackageCardData {
  id: string;
  image: string;
  title: string;
  price: string;
  duration: string;
  rating: number;
}

interface PackageCardProps extends PackageCardData {
  onPress: () => void;
  variant?: 'horizontal' | 'vertical';
}

export const PackageCard = React.memo(({ image, title, price, duration, rating, onPress, variant = 'horizontal' }: PackageCardProps) => {
  const isHorizontal = variant === 'horizontal';

  return (
    <TouchableOpacity
      style={[s.card, isHorizontal ? s.cardH : s.cardV]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: image }}
        style={[s.image, isHorizontal ? s.imageH : s.imageV]}
        resizeMode="cover"
      />
      {/* Arrow button overlay */}
      <TouchableOpacity style={s.arrowBtn} onPress={onPress} activeOpacity={0.8}>
        <Ionicons name="arrow-forward" size={14} color="#000000" />
      </TouchableOpacity>

      <View style={s.footer}>
        <Text style={[s.title, { fontFamily: AF.bold }]} numberOfLines={2}>{title}</Text>
        <View style={s.meta}>
          <Text style={[s.price, { fontFamily: AF.bold }]}>{price}</Text>
          <Text style={[s.duration, { fontFamily: AF.regular }]}>{duration}</Text>
        </View>

        <View style={s.stars}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < Math.floor(rating) ? 'star' : 'star-outline'}
              size={11}
              color="#305c5d"
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fbf6f4',
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardH: {
    width: 180,
    marginRight: 12,
  },
  cardV: {
    width: '100%',
    marginBottom: 16,
  },
  image: {
    width: '100%',
  },
  imageH: {
    height: 135, // ~65% of 220px card
  },
  imageV: {
    height: 185,
  },
  arrowBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fbf6f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 12,
    gap: 4,
  },
  title: {
    fontSize: 13,
    color: '#000000',
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 13,
    color: '#305c5d',
  },
  duration: {
    fontSize: 11,
    color: '#dabf7e',
  },

  stars: {
    flexDirection: 'row',
    gap: 2,
  },
});
