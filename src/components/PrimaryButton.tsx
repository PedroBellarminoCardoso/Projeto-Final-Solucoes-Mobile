import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export function PrimaryButton({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.button, disabled && styles.disabled]}><Text style={styles.text}>{title}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  button: { backgroundColor: colors.primary, padding: 15, borderRadius: 13, alignItems: 'center', marginTop: 8 },
  disabled: { opacity: 0.5 },
  text: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 }
});
