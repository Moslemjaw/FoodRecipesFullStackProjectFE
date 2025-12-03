import React from 'react';
import { StyleSheet, View, ViewProps, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Layout, Shadows } from '@/constants/LiqmahTheme';

interface LiqmahGlassProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  gradient?: boolean; // Optional subtle gradient overlay
}

export const LiqmahGlass: React.FC<LiqmahGlassProps> = ({ 
  children, 
  style, 
  intensity = 50,
  tint = 'light',
  ...props 
}) => {
  // On Android, BlurView can be heavy or not supported well on old devices.
  // We can fallback to a semi-transparent white view if needed, 
  // but expo-blur usually handles it well now or falls back gracefully.
  // For the "Liqmah" look, we want a white semi-transparent background.
  
  return (
    <View style={[styles.container, style]} {...props}>
      <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
      <View style={[styles.content, { backgroundColor: Colors.base.glass.light }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: Layout.radius.card,
    borderColor: Colors.base.border.light,
    borderWidth: 1,
    ...Shadows.floating,
  },
  content: {
    flex: 1,
  },
});

