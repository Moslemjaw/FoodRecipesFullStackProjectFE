import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Layout, Shadows } from '@/constants/LiqmahTheme';

interface LiqmahGlassProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  gradient?: boolean;
}

export const LiqmahGlass: React.FC<LiqmahGlassProps> = ({
  children,
  intensity = 30,
  tint = 'light',
  style,
  gradient = false,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
      <View style={styles.border} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.radius.card,
    overflow: 'hidden',
    backgroundColor: Colors.base.glass.light,
    ...Shadows.glassCard,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: Colors.base.border.light,
    borderRadius: Layout.radius.card,
  },
});
