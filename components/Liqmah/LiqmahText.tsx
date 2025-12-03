import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Typography, Colors } from '@/constants/LiqmahTheme';

interface LiqmahTextProps extends TextProps {
  variant?: keyof typeof Typography.sizes;
  weight?: keyof typeof Typography.fonts;
  color?: string;
}

export const LiqmahText: React.FC<LiqmahTextProps> = ({ 
  children, 
  variant = 'body', 
  weight = 'regular', 
  color = Colors.text.primary,
  style, 
  ...props 
}) => {
  return (
    <Text 
      style={[
        {
          fontSize: Typography.sizes[variant],
          fontFamily: Typography.fonts[weight],
          color: color,
        },
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
};

