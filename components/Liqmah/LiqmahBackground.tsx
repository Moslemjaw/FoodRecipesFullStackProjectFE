import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Colors } from '@/constants/LiqmahTheme';

interface LiqmahBackgroundProps extends ViewProps {
  gradient?: string[]; // Kept for prop compatibility, but ignored for clean look
}

export const LiqmahBackground: React.FC<LiqmahBackgroundProps> = ({ 
  children, 
  gradient,
  style,
  ...props 
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Pure black for immersive dark mode
  },
});
