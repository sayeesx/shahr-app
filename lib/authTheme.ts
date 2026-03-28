// lib/authTheme.ts
export const AC = {
    bg: '#ede6df',
    surface: '#fbf6f4',
    border: '#d3ccbe',
    borderFaint: 'rgba(0,0,0,0.1)',
    borderSubtle: '#d3ccbe',
    primary: '#305c5d',
    primaryPress: '#254a4b',
    text: '#000000',
    textSub: '#444444',
    textMuted: '#777777',
    error: '#C94040',
    success: '#3A9E6A',
    warning: '#C07A10',
    accent: '#dabf7e',
};

// Border-radius tokens
export const AR = {
    field: 100,
    button: 100,
    card: 24,
    toggle: 100,
};

// Spacing tokens
export const AS = {
    fieldHeight: 58,
    buttonHeight: 58,
    pad: 26,
    gap: 16,
};

/**
 * Font families
 *
 * DM Sans is used as the "Google Sans" substitute throughout the entire app.
 * Playfair Display is reserved ONLY for the user name in the home screen greeting.
 */
export const AF = {
    regular:  'DMSans-Regular',
    medium:   'DMSans-Medium',
    semibold: 'DMSans-SemiBold',
    bold:     'DMSans-Bold',
    italic:   'DMSans-Regular',

    // Playfair Display — used ONLY for user name on home screen greeting
    playfair: 'PlayfairDisplay-Regular',
    playfairBold: 'PlayfairDisplay-Bold',
};