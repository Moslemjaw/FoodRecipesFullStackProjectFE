import React from 'react';
import { StyleSheet, View, ViewProps, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Colors, Layout, Shadows } from '@/constants/LiqmahTheme';

interface LiqmahCardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'hero';
  pressable?: boolean;
  onPress?: () => void;
  activeOpacity?: number;
}

export const LiqmahCard: React.FC<LiqmahCardProps> = ({
  children,
  variant = 'default',
  pressable = false,
  onPress,
  activeOpacity = 0.7,
  style,
  ...props
}) => {
  const cardStyle = [
    styles.base,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'hero' && styles.hero,
    style,
  ];

  if (pressable) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={activeOpacity}
        {...(props as TouchableOpacityProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.base.surface,
    borderRadius: Layout.radius.card,
    padding: Layout.spacing.md,
  },
  elevated: {
    ...Shadows.card,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.base.border.strong,
    backgroundColor: 'transparent',
  },
  hero: {
    backgroundColor: Colors.base.surface,
    borderRadius: Layout.radius.card,
    ...Shadows.floating,
    padding: 0, // Hero cards manage their own padding
    overflow: 'hidden',
  },
});

