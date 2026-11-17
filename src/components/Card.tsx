import React from 'react';
import { StyleSheet, Text, View, ViewProps } from 'react-native';
import { colors } from '../theme/colors';

interface CardProps extends ViewProps {
  title?: string;
  rightText?: string;
  onPressRight?: () => void;
  children: React.ReactNode;
}

export function Card({ title, children, style, ...props }: CardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {!!title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10
  }
});
