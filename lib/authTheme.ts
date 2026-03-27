// lib/authTheme.ts
export const AC = {
    bg: '#ede6df',
    surface: '#fbf6f4',
    border: '#d3ccbe',
    borderFaint: 'rgba(0,0,0,0.1)',
    borderSubtle: '#d3ccbe',
    primary: '#305c5d',     // Green from home screen
    primaryPress: '#254a4b', // Darker green
    text: '#000000',
    textSub: '#444444',     // changed from yellow to blackish
    textMuted: '#777777',   // changed from yellow to blackish
    error: '#C94040',
    success: '#3A9E6A',
    warning: '#C07A10',
    accent: '#dabf7e', // Golden yellow
};

// Border-radius tokens
export const AR = {
    field: 100, // pill inputs
    button: 100, // pill buttons
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

// Font families — must match the keys registered in useFonts hook
export const AF = {
    regular: 'PlayfairDisplay',
    semibold: 'PlayfairDisplay-SemiBold',
    bold: 'PlayfairDisplay-Bold',
    medium: 'PlayfairDisplay-Medium',
    italic: 'PlayfairDisplay',
};