import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/LiqmahTheme';

interface LiqmahBackgroundProps extends ViewProps {
  gradient?: string[];
}

export const LiqmahBackground: React.FC<LiqmahBackgroundProps> = ({ 
  children, 
  gradient = Colors.gradients.mintMist,
  style,
  ...props 
}) => {
  return (
    <View style={[styles.container, style]} {...props}>
      <LinearGradient
        colors={gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light base background
  },
});

