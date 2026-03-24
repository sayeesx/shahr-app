import React, { useEffect, useRef } from 'react';
import { View, Animated, type StyleProp, type ViewStyle } from 'react-native';

interface SkeletonLineProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonLine({
  width = '100%',
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonLineProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#E2E8F0',
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          backgroundColor: '#FFFFFF',
          borderRadius: 18,
          padding: 20,
          shadowColor: '#0D3B5C',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 2,
          gap: 12,
        },
        style,
      ]}
    >
      <SkeletonLine width="60%" height={20} />
      <SkeletonLine width="90%" height={14} />
      <SkeletonLine width="75%" height={14} />
      <SkeletonLine width="40%" height={12} borderRadius={99} />
    </View>
  );
}
