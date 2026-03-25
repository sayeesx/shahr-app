import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
  type TouchableOpacityProps,
} from 'react-native';
import { Colors, Spacing, Shadows } from '../../lib/theme';

interface CardProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'dark';
  style?: ViewStyle;
  children: React.ReactNode;
}

export function Card({
  variant = 'secondary',
  style,
  children,
  onPress,
  ...rest
}: CardProps) {
  const backgroundColor =
    variant === 'primary'
      ? Colors.primary
      : variant === 'dark'
        ? Colors.cardDark
        : Colors.card;

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      activeOpacity={0.97}
      style={[
        styles.card,
        {
          backgroundColor,
        },
        style,
      ]}
      onPress={onPress}
      {...rest}
    >
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.radiusLarge,
    padding: Spacing.cardPadding,
    ...Shadows.card,
  },
});
