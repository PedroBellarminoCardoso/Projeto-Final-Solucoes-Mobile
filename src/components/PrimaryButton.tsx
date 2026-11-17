import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title?: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: string;
}

export function PrimaryButton({
  title = 'Salvar',
  onPress,
  disabled = false,
  icon,
  style,
  ...props
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.disabled, style]}
      {...props}
    >
      {!!icon && <Feather name={icon as any} size={17} color="#FFFFFF" style={styles.icon} />}
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  disabled: {
    opacity: 0.5
  },
  icon: {
    marginRight: 8
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15
  }
});
