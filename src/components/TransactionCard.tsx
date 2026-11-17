import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Transaction } from '../types/Transaction';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/currency';

export function TransactionCard({ item, onDelete }: { item: Transaction; onDelete?: (id: string) => void }) {
  const isIncome = item.type === 'income';
  return (
    <View style={styles.card}>
      <View style={[styles.icon, { backgroundColor: isIncome ? colors.softGreen : colors.softRed }]}>
        <Text>{isIncome ? '↙' : '↗'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.description}</Text>
        <Text style={styles.meta}>{item.category} • {new Date(`${item.date}T12:00:00`).toLocaleDateString('pt-BR')}</Text>
      </View>
      <View style={styles.amountArea}>
        <Text style={[styles.amount, { color: isIncome ? colors.income : colors.expense }]}>
          {isIncome ? '+' : '-'} {formatCurrency(item.amount)}
        </Text>
        {!!onDelete && <TouchableOpacity onPress={() => onDelete(item.id)}><Text style={styles.delete}>Excluir</Text></TouchableOpacity>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 13, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 11 },
  name: { color: colors.text, fontWeight: '700', fontSize: 14 },
  meta: { color: colors.muted, fontSize: 11, marginTop: 4 },
  amountArea: { alignItems: 'flex-end' },
  amount: { fontSize: 12, fontWeight: '700' },
  delete: { color: colors.expense, fontSize: 11, marginTop: 5 }
});
