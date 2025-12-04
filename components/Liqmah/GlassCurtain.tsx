import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LiqmahText } from './LiqmahText';
import { Colors } from '@/constants/LiqmahTheme';
import { LiqmahButton } from './LiqmahButton';
import { useRouter } from 'expo-router';

interface GlassCurtainProps {
  message?: string;
  buttonLabel?: string;
  onPress?: () => void;
}

export const GlassCurtain: React.FC<GlassCurtainProps> = ({
  message = "Sign in to unlock steps",
  buttonLabel = "Sign In",
  onPress,
}) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(auth)/login');
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.content}>
        <LiqmahText variant="headline" weight="semiBold" color={Colors.text.primary} style={styles.message}>
          {message}
        </LiqmahText>
        <LiqmahButton 
          label={buttonLabel} 
          onPress={handlePress} 
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderRadius: 12, 
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  content: {
    alignItems: 'center',
    padding: 24,
    width: '100%',
  },
  message: {
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    width: 200,
  },
});
