import React from 'react';
import {
  Text,
  StyleSheet,
  type TextStyle,
} from 'react-native';
import { Colors, Typography, Fonts } from '../../lib/theme';

type TextVariant = 'greeting' | 'title' | 'section' | 'cardTitle' | 'body' | 'small' | 'caption';

interface ThemedTextProps {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'muted' | 'light' | 'lightMuted' | 'accent';
  style?: TextStyle;
  children: React.ReactNode;
  numberOfLines?: number;
}

export function ThemedText({
  variant = 'body',
  color = 'primary',
  style,
  children,
  numberOfLines,
}: ThemedTextProps) {
  const colorValue =
    color === 'primary'
      ? Colors.textPrimary
      : color === 'secondary'
        ? Colors.textSecondary
        : color === 'muted'
          ? Colors.textMuted
          : color === 'light'
            ? Colors.textLight
            : color === 'lightMuted'
              ? Colors.textLightMuted
              : Colors.primary;

  return (
    <Text
      style={[
        styles[variant],
        { color: colorValue },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontFamily: Fonts.primary,
    fontSize: Typography.sizeGreeting,
    fontWeight: '400',
    letterSpacing: Typography.letterSpacingNormal,
    lineHeight: Typography.sizeGreeting * Typography.lineHeightNormal,
  },
  title: {
    fontFamily: Fonts.primaryBold,
    fontSize: Typography.sizeTitle,
    fontWeight: '700',
    letterSpacing: Typography.letterSpacingTight,
    lineHeight: Typography.sizeTitle * Typography.lineHeightTight,
  },
  section: {
    fontFamily: Fonts.primarySemiBold,
    fontSize: Typography.sizeSection,
    fontWeight: '600',
    letterSpacing: Typography.letterSpacingTight,
    lineHeight: Typography.sizeSection * Typography.lineHeightTight,
  },
  cardTitle: {
    fontFamily: Fonts.primaryMedium,
    fontSize: Typography.sizeCardTitle,
    fontWeight: '500',
    letterSpacing: Typography.letterSpacingTight,
    lineHeight: Typography.sizeCardTitle * Typography.lineHeightTight,
  },
  body: {
    fontFamily: Fonts.primary,
    fontSize: Typography.sizeBody,
    fontWeight: '400',
    letterSpacing: Typography.letterSpacingTight,
    lineHeight: Typography.sizeBody * Typography.lineHeightNormal,
  },
  small: {
    fontFamily: Fonts.primary,
    fontSize: Typography.sizeSmall,
    fontWeight: '400',
    letterSpacing: Typography.letterSpacingTight,
    lineHeight: Typography.sizeSmall * Typography.lineHeightNormal,
  },
  caption: {
    fontFamily: Fonts.primaryMedium,
    fontSize: Typography.sizeCaption,
    fontWeight: '500',
    letterSpacing: Typography.letterSpacingWide,
    textTransform: 'uppercase',
  },
});
