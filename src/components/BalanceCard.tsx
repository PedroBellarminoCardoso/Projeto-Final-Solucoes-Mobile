import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/currency';

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
  const mask = (value: number) => (hideValues ? 'R$ •••••' : formatCurrency(value));

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

      <Text style={styles.balance}>{mask(balance)}</Text>
      <Text style={styles.subNote}>Resumo financeiro de {monthName.toLowerCase()}</Text>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.smallLabel}>↙ Receitas</Text>
          <Text style={styles.metricValue}>{mask(income)}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.smallLabel}>↗ Despesas</Text>
          <Text style={styles.metricValue}>{mask(expenses)}</Text>
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
    fontWeight: '600'
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
    fontWeight: '800',
    marginTop: 6
  },
  subNote: {
    color: '#DFD2FF',
    fontSize: 11,
    marginTop: 4
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
    marginBottom: 4
  },
  metricValue: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16
  }
});
