import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/currency';

export function BalanceCard({ balance, income, expenses }: { balance: number; income: number; expenses: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Saldo atual</Text>
      <Text style={styles.balance}>{formatCurrency(balance)}</Text>
      <View style={styles.row}>
        <View style={styles.item}><Text style={styles.smallLabel}>↑ Receitas</Text><Text style={styles.income}>{formatCurrency(income)}</Text></View>
        <View style={styles.item}><Text style={styles.smallLabel}>↓ Despesas</Text><Text style={styles.expense}>{formatCurrency(expenses)}</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.primary, borderRadius: 20, padding: 22, marginBottom: 18 },
  label: { color: '#DCE7FF', fontSize: 14 },
  balance: { color: '#FFFFFF', fontSize: 31, fontWeight: '800', marginTop: 7, marginBottom: 22 },
  row: { flexDirection: 'row' },
  item: { flex: 1 },
  smallLabel: { color: '#DCE7FF', fontSize: 12, marginBottom: 5 },
  income: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  expense: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 }
});
