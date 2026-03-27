import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AF } from '../../lib/authTheme';


interface QuickAccessCardProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  isActive?: boolean;
  onPress: () => void;
  images?: any[];
}

function Slideshow({ images, isActive }: { images: any[], isActive: boolean }) {
  const opacities = useRef(images.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;

  useEffect(() => {
    if (!images || images.length < 2) return;
    let idx = 0;
    const interval = setInterval(() => {
      const nextIdx = (idx + 1) % images.length;
      Animated.parallel([
        Animated.timing(opacities[idx], { toValue: 0, duration: 1200, useNativeDriver: true }),
        Animated.timing(opacities[nextIdx], { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]).start(() => {
        idx = nextIdx;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <View style={[StyleSheet.absoluteFill, { borderRadius: 18, overflow: 'hidden' }]}>
      {images.map((src, i) => (
        <Animated.Image
          key={i}
          source={src}
          style={[StyleSheet.absoluteFill, { opacity: opacities[i], width: '100%', height: '100%' }]}
          resizeMode="cover"
        />
      ))}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />
    </View>
  );
}

export const QuickAccessCard = React.memo(({ label, iconName, isActive = false, onPress, images }: QuickAccessCardProps) => {
  const hasImage = images && images.length > 0;
  
  return (
    <TouchableOpacity
      style={[s.card, isActive ? s.cardActive : s.cardInactive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {hasImage && <Slideshow images={images} isActive={isActive} />}
      <View style={[s.iconWrap, isActive ? s.iconWrapActive : (hasImage ? s.iconWrapImage : s.iconWrapInactive)]}>
        <Ionicons name={iconName} size={22} color={isActive ? '#dabf7e' : (hasImage ? '#ffffff' : '#000000')} />
      </View>
      <Text style={[s.label, isActive ? s.labelActive : (hasImage ? s.labelImage : s.labelInactive), { fontFamily: AF.bold }]} numberOfLines={2}>
        {label}
      </Text>

    </TouchableOpacity>
  );
});

const s = StyleSheet.create({
  card: {
    flex: 1,
    height: 100,
    borderRadius: 18,
    padding: 14,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardActive: {
    backgroundColor: '#305c5d',
  },
  cardInactive: {
    backgroundColor: '#fbf6f4',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  iconWrapInactive: {
    backgroundColor: '#fbf6f4',
  },
  label: {
    fontSize: 13,
    lineHeight: 17,
  },

  labelActive: {
    color: '#dabf7e',
  },
  labelInactive: {
    color: '#000000',
  },
  labelImage: {
    color: '#ffffff',
  },
  iconWrapImage: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});
