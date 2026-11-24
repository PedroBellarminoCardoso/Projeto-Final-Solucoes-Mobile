import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { currentMonthLabel } from '../utils/date';
import { fonts } from '../theme/fonts';

interface MonthSelectorProps {
  month: Date;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthSelector({ month, onPrev, onNext }: MonthSelectorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrev} style={styles.arrowButton}>
        <Feather name="chevron-left" size={18} color={colors.muted} />
      </TouchableOpacity>
      <View style={styles.center}>
        <Feather name="calendar" size={14} color={colors.primary} style={styles.icon} />
        <Text style={styles.label}>{currentMonthLabel(month)}</Text>
      </View>
      <TouchableOpacity onPress={onNext} style={styles.arrowButton}>
        <Feather name="chevron-right" size={18} color={colors.muted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 14
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  center: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    marginRight: 7
  },
  label: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.text
  }
});
