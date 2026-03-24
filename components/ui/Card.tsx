import React from 'react';
import { View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  elevated?: boolean;
}

export function Card({ children, style, padding = 20, elevated = true, ...rest }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: '#FFFFFF',
          borderRadius: 18,
          padding,
          ...(elevated && {
            shadowColor: '#0D3B5C',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
          }),
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
