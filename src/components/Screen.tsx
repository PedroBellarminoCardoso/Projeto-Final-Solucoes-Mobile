import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface ScreenProps {
  title: string;
  subtitle?: string;
  overline?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
}

export function Screen({ title, subtitle, overline, onBack, rightAction, children }: ScreenProps) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {!!onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Feather name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
          <View style={styles.titleBlock}>
            {!!overline && <Text style={styles.overline}>{overline}</Text>}
            <Text style={styles.title}>{title}</Text>
            {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
        {!!rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 28
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  titleBlock: {
    flex: 1
  },
  overline: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 1,
    color: colors.primary,
    marginBottom: 2,
    textTransform: 'uppercase'
  },
  title: {
    fontSize: 23,
    fontFamily: fonts.bold,
    color: colors.text
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
    fontFamily: fonts.regular
  },
  rightAction: {
    marginLeft: 12
  }
});
