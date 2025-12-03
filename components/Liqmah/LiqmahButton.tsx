import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, View, ActivityIndicator } from 'react-native';
import { LiqmahText } from './LiqmahText';
import { Colors, Layout, Shadows } from '@/constants/LiqmahTheme';
import { LinearGradient } from 'expo-linear-gradient';

interface LiqmahButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'tertiary';
  label: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const LiqmahButton: React.FC<LiqmahButtonProps> = ({ 
  label, 
  variant = 'primary', 
  icon, 
  loading,
  style, 
  disabled,
  ...props 
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  
  const content = (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#FFF' : Colors.primary.mint} />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <LiqmahText 
            variant="body" 
            weight="semiBold" 
            color={isPrimary ? '#FFF' : (isSecondary ? Colors.text.primary : Colors.primary.mint)}
          >
            {label}
          </LiqmahText>
        </>
      )}
    </View>
  );

  if (isPrimary) {
    return (
      <TouchableOpacity 
        style={[styles.base, styles.primary, disabled && styles.disabled, style]} 
        activeOpacity={0.8}
        disabled={disabled || loading}
        {...props}
      >
        <LinearGradient
          colors={[Colors.primary.mint, '#34D399'] as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[
        styles.base, 
        isSecondary ? styles.secondary : styles.tertiary, 
        disabled && styles.disabled, 
        style
      ]} 
      activeOpacity={0.6}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: Layout.radius.button,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  primary: {
    ...Shadows.button.mint,
  },
  secondary: {
    backgroundColor: Colors.base.glass.light,
    borderWidth: 1,
    borderColor: Colors.base.border.light,
    // Secondary buttons might not need heavy shadows, maybe just subtle
  },
  tertiary: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
});

