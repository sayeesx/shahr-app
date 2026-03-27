// ─── STRICT VISUAL SYSTEM ────────────────────────────────────────────────────
// Based on reference image: White theme, Playfair Display font, Green accents

export const Colors = {
  // Background
  background: '#ede6df',
  backgroundElevated: '#fbf6f4',
  backgroundDark: '#ede6df',

  // Primary Accent (Green from reference)
  primary: '#305c5d',
  primaryDark: '#254a4b',
  primaryLight: '#4b7a7b',

  // Cards
  card: '#fbf6f4',
  cardSecondary: '#ede6df',
  cardDark: '#ede6df',

  // Text
  textPrimary: '#000000',
  textSecondary: '#dabf7e',
  textMuted: '#dabf7e',
  textLight: '#FFFFFF',
  textLightMuted: '#dabf7e',

  // UI
  border: '#e2d7c2',
  divider: '#ede6df',
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
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  cardElevated: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  button: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  float: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
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
