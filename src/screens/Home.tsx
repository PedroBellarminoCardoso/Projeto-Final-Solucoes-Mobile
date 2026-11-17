import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Screen } from '../components/Screen';
import { BalanceCard } from '../components/BalanceCard';
import { TransactionCard } from '../components/TransactionCard';
import { useFinance } from '../contexts/FinanceContext';
import { getTotals } from '../utils/calculations';
import { currentMonthLabel } from '../utils/date';
import { colors } from '../theme/colors';

export function HomeScreen({ onAdd, onSeeAll }: { onAdd: () => void; onSeeAll: () => void }) {
  const { transactions } = useFinance();
  const totals = getTotals(transactions);
  return (
    <Screen title="Cadê Meu Dinheiro?" subtitle={currentMonthLabel()}>
      <BalanceCard {...totals} />
      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickButton} onPress={onAdd}><Text style={styles.quickPlus}>＋</Text><Text style={styles.quickText}>Adicionar movimentação</Text></TouchableOpacity>
      </View>
      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Últimas movimentações</Text><TouchableOpacity onPress={onSeeAll}><Text style={styles.link}>Ver todas</Text></TouchableOpacity></View>
      {transactions.length === 0
        ? <View style={styles.empty}><Text style={styles.emptyIcon}>₿</Text><Text style={styles.emptyTitle}>Seu dinheiro começa aqui</Text><Text style={styles.emptyText}>Adicione sua primeira receita ou despesa para acompanhar seu saldo.</Text></View>
        : transactions.slice(0, 4).map(item => <TransactionCard key={item.id} item={item} />)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  quickRow: { marginBottom: 22 },
  quickButton: { backgroundColor: colors.softBlue, padding: 15, borderRadius: 14, flexDirection: 'row', alignItems: 'center' },
  quickPlus: { color: colors.primary, fontSize: 22, fontWeight: '700', marginRight: 9 },
  quickText: { color: colors.primary, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  link: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  empty: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 25, alignItems: 'center', borderColor: colors.border, borderWidth: 1 },
  emptyIcon: { fontSize: 30, color: colors.primary },
  emptyTitle: { color: colors.text, fontWeight: '800', marginTop: 8 },
  emptyText: { color: colors.muted, textAlign: 'center', marginTop: 6, lineHeight: 20 }
});
