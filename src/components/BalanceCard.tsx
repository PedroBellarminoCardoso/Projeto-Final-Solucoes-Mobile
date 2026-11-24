import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/currency';
import { FadeValue } from './FadeValue';
import { fonts } from '../theme/fonts';

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
  monthName?: string;
  hideValues?: boolean;
  onToggleHide?: () => void;
}

export function BalanceCard({
  balance,
  income,
  expenses,
  monthName = 'mês',
  hideValues = false,
  onToggleHide
}: BalanceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.label}>Saldo atual</Text>
        {!!onToggleHide && (
          <TouchableOpacity onPress={onToggleHide} style={styles.eyeButton}>
            <Feather name={hideValues ? 'eye-off' : 'eye'} size={16} color="#E6DCFF" />
          </TouchableOpacity>
        )}
      </View>

      <FadeValue value={formatCurrency(balance)} masked="R$ •••••" hidden={hideValues} style={styles.balance} />
      <Text style={styles.subNote}>Resumo financeiro de {monthName.toLowerCase()}</Text>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.smallLabel}>↙ Receitas</Text>
          <FadeValue value={formatCurrency(income)} masked="R$ •••••" hidden={hideValues} style={styles.metricValue} />
        </View>
        <View style={styles.item}>
          <Text style={styles.smallLabel}>↗ Despesas</Text>
          <FadeValue value={formatCurrency(expenses)} masked="R$ •••••" hidden={hideValues} style={styles.metricValue} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  label: {
    color: '#E6DCFF',
    fontSize: 13,
    fontFamily: fonts.bold
  },
  eyeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center'
  },
  balance: {
    color: '#FFFFFF',
    fontSize: 31,
    fontFamily: fonts.semibold,
    marginTop: 6
  },
  subNote: {
    color: '#DFD2FF',
    fontSize: 11,
    marginTop: 4,
    fontFamily: fonts.regular
  },
  divider: {
    height: 1,
    backgroundColor: colors.primaryLight,
    marginVertical: 14
  },
  row: {
    flexDirection: 'row'
  },
  item: {
    flex: 1
  },
  smallLabel: {
    color: '#E6DCFF',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: fonts.regular
  },
  metricValue: {
    color: '#FFFFFF',
    fontFamily: fonts.regular,
    fontSize: 16
  }
});
