import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  textStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
}

const VARIANTS: Record<Variant, { container: ViewStyle; text: TextStyle; loader: string }> = {
  primary: {
    container: {
      backgroundColor: '#0D3B5C',
      borderWidth: 0,
    },
    text: { color: '#FFFFFF', fontWeight: '700' },
    loader: '#FFFFFF',
  },
  secondary: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: '#0D3B5C',
    },
    text: { color: '#0D3B5C', fontWeight: '600' },
    loader: '#0D3B5C',
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    text: { color: '#2ba89a', fontWeight: '600' },
    loader: '#2ba89a',
  },
  gold: {
    container: {
      backgroundColor: '#ECC94B',
      borderWidth: 0,
    },
    text: { color: '#082540', fontWeight: '700' },
    loader: '#082540',
  },
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = true,
  style,
  textStyle,
  disabled,
  ...rest
}: ButtonProps) {
  const v = VARIANTS[variant];

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      disabled={disabled || loading}
      style={[
        {
          borderRadius: 14,
          paddingVertical: 15,
          paddingHorizontal: 24,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: disabled || loading ? 0.6 : 1,
          shadowColor: variant === 'primary' ? '#0D3B5C' : 'transparent',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: variant === 'primary' ? 5 : 0,
        },
        v.container,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.loader} />
      ) : (
        <Text
          style={[
            { fontSize: 16, letterSpacing: 0.3 },
            v.text,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
