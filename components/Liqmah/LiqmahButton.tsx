import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableOpacityProps, View, ActivityIndicator } from 'react-native';
import { LiqmahText } from './LiqmahText';
import { Colors, Layout, Shadows } from '@/constants/LiqmahTheme';
import { LinearGradient } from 'expo-linear-gradient';

interface LiqmahButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline';
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
  const isOutline = variant === 'outline';
  
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
            color={
              isPrimary 
                ? '#FFF' 
                : isOutline 
                ? Colors.primary.mint 
                : isSecondary 
                ? Colors.text.primary 
                : Colors.primary.mint
            }
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

  if (isSecondary) {
     return (
      <TouchableOpacity 
        activeOpacity={0.7}
        disabled={disabled || loading}
        style={[styles.base, styles.secondary, disabled && styles.disabled, style]}
        {...props}
      >
        {content}
      </TouchableOpacity>
    );
  }

  if (isOutline) {
    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        disabled={disabled || loading}
        style={[styles.base, styles.outline, disabled && styles.disabled, style]}
        {...props}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[
        styles.base, 
        styles.tertiary, 
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
    zIndex: 1,
  },
  iconContainer: {
    marginRight: 8,
  },
  primary: {
    ...Shadows.button.mint,
  },
  secondary: {
    backgroundColor: Colors.base.surface,
    borderWidth: 1,
    borderColor: Colors.base.border.strong,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary.mint,
  },
  tertiary: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
});
