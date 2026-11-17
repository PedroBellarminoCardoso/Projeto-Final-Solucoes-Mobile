import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { useFinance } from '../contexts/FinanceContext';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/currency';

const monthlyLimit = 800;

export function BudgetsScreen() {
  const { transactions } = useFinance();
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const progress = Math.min(expenses / monthlyLimit, 1);
  const remaining = Math.max(monthlyLimit - expenses, 0);
  return (
    <Screen title="Limites de gastos" subtitle="Acompanhe seu orçamento mensal">
      <View style={styles.card}>
        <Text style={styles.caption}>Orçamento mensal de demonstração</Text>
        <Text style={styles.amount}>{formatCurrency(monthlyLimit)}</Text>
        <View style={styles.track}><View style={[styles.fill, { width: `${progress * 100}%` }]} /></View>
        <View style={styles.row}><Text style={styles.muted}>Gasto: {formatCurrency(expenses)}</Text><Text style={styles.muted}>Restante: {formatCurrency(remaining)}</Text></View>
        <Text style={styles.note}>Este limite é apenas um exemplo. A edição do orçamento poderá ser adicionada em uma próxima versão.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border },
  caption: { color: colors.muted, fontSize: 13 },
  amount: { color: colors.text, fontWeight: '800', fontSize: 28, marginVertical: 12 },
  track: { height: 12, backgroundColor: colors.border, borderRadius: 10, overflow: 'hidden' },
  fill: { height: 12, backgroundColor: colors.primary, borderRadius: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap' },
  muted: { color: colors.muted, fontSize: 12 },
  note: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 20 }
});
