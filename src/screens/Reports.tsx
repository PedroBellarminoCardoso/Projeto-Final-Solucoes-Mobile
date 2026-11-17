import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { useFinance } from '../contexts/FinanceContext';
import { getTotals } from '../utils/calculations';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/currency';

export function ReportsScreen() {
  const { transactions } = useFinance();
  const totals = getTotals(transactions);
  const categoryTotals = transactions.filter(t => t.type === 'expense').reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});
  const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  return (
    <Screen title="Relatórios" subtitle="Entenda seus hábitos financeiros">
      <View style={styles.summary}>
        <Text style={styles.label}>Receitas</Text><Text style={styles.income}>{formatCurrency(totals.income)}</Text>
        <Text style={styles.label}>Despesas</Text><Text style={styles.expense}>{formatCurrency(totals.expenses)}</Text>
        <Text style={styles.label}>Resultado</Text><Text style={styles.result}>{formatCurrency(totals.balance)}</Text>
      </View>
      <Text style={styles.heading}>Despesas por categoria</Text>
      {entries.length === 0 ? <Text style={styles.empty}>Ainda não há despesas para analisar.</Text> : entries.map(([name, value]) => {
        const percent = totals.expenses ? value / totals.expenses : 0;
        return <View key={name} style={styles.categoryRow}>
          <View style={styles.row}><Text style={styles.categoryName}>{name}</Text><Text style={styles.value}>{formatCurrency(value)}</Text></View>
          <View style={styles.track}><View style={[styles.bar, { width: `${percent * 100}%` }]} /></View>
        </View>;
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.muted, fontSize: 12, marginTop: 5 },
  income: { color: colors.income, fontSize: 19, fontWeight: '800', marginBottom: 8 },
  expense: { color: colors.expense, fontSize: 19, fontWeight: '800', marginBottom: 8 },
  result: { color: colors.primary, fontSize: 19, fontWeight: '800' },
  heading: { color: colors.text, fontWeight: '800', fontSize: 17, marginTop: 24, marginBottom: 14 },
  empty: { color: colors.muted },
  categoryRow: { marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  categoryName: { color: colors.text, fontWeight: '600' },
  value: { color: colors.muted, fontSize: 12 },
  track: { height: 8, backgroundColor: colors.border, borderRadius: 8, overflow: 'hidden' },
  bar: { height: 8, backgroundColor: colors.primary, borderRadius: 8 }
});
