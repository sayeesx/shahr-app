// ─── STRICT VISUAL SYSTEM ────────────────────────────────────────────────────
// Based on reference image: White theme, Playfair Display font, Green accents

export const Colors = {
  // Background
  background: '#FFFFFF',
  backgroundElevated: '#F8F8F8',
  backgroundDark: '#F5F5F5',

  // Primary Accent (Green from reference)
  primary: '#8BC34A',
  primaryDark: '#7CB342',
  primaryLight: '#9CCC65',

  // Cards
  card: '#F5F5F5',
  cardSecondary: '#EEEEEE',
  cardDark: '#E0E0E0',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#999999',
  textLight: '#FFFFFF',
  textLightMuted: '#B3B3B3',

  // UI
  border: '#E5E5E5',
  divider: '#EEEEEE',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Status
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#FF5252',
} as const;

// ─── FONTS ───────────────────────────────────────────────────────────────────
export const Fonts = {
  primary: 'PlayfairDisplay',
  primaryBold: 'PlayfairDisplay-Bold',
  primarySemiBold: 'PlayfairDisplay-SemiBold',
  primaryMedium: 'PlayfairDisplay-Medium',
} as const;

// ─── SPACING SYSTEM ─────────────────────────────────────────────────────────
export const Spacing = {
  // Screen
  screenPadding: 20,

  // Cards
  cardPadding: 16,
  cardGap: 12,

  // Sections
  sectionGap: 24,
  subsectionGap: 16,

  // Elements
  elementGap: 12,
  textGap: 4,

  // Border Radius
  radiusSmall: 12,
  radiusMedium: 16,
  radiusLarge: 20,
  radiusXL: 24,
  radiusFull: 9999,
} as const;

// ─── TYPOGRAPHY ───────────────────────────────────────────────────────────
// Playfair Display from Google Fonts
export const Typography = {
  // Sizes
  sizeGreeting: 16,
  sizeTitle: 32,
  sizeSection: 20,
  sizeCardTitle: 16,
  sizeBody: 14,
  sizeSmall: 13,
  sizeCaption: 12,

  // Weights
  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightSemibold: '600' as const,
  weightBold: '700' as const,

  // Letter Spacing
  letterSpacingTight: -0.5,
  letterSpacingNormal: 0,
  letterSpacingWide: 0.5,

  // Line Height
  lineHeightTight: 1.2,
  lineHeightNormal: 1.4,
  lineHeightRelaxed: 1.6,
} as const;

// ─── SHADOWS ────────────────────────────────────────────────────────────────
export const Shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardElevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    shadowColor: '#8BC34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  float: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

// ─── ANIMATION ──────────────────────────────────────────────────────────────
export const Animation = {
  pressScale: 0.97,
  pressDuration: 150,
  fadeDuration: 200,
  springConfig: {
    tension: 300,
    friction: 20,
  },
} as const;
