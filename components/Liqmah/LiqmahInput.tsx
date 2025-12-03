import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View, Text } from 'react-native';
import { Colors, Layout, Typography } from '@/constants/LiqmahTheme';

interface LiqmahInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const LiqmahInput: React.FC<LiqmahInputProps> = ({ 
  label, 
  error, 
  icon,
  style, 
  ...props 
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error ? styles.errorBorder : null]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput 
          style={[styles.input, style]}
          placeholderTextColor={Colors.text.tertiary}
          cursorColor={Colors.primary.mint}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.caption,
    color: Colors.text.secondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: Colors.base.glass.light,
    borderRadius: Layout.radius.input,
    borderWidth: 1,
    borderColor: Colors.base.border.medium,
    paddingHorizontal: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.body,
    color: Colors.text.primary,
    height: '100%',
  },
  errorBorder: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.micro,
    color: '#EF4444',
    marginTop: 4,
    marginLeft: 4,
  },
});

