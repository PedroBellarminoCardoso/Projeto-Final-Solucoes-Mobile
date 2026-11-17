import React from 'react';
import { Alert, Text } from 'react-native';
import { Screen } from '../components/Screen';
import { TransactionCard } from '../components/TransactionCard';
import { useFinance } from '../contexts/FinanceContext';
import { colors } from '../theme/colors';

export function TransactionsScreen() {
  const { transactions, removeTransaction } = useFinance();
  const confirmDelete = (id: string) => Alert.alert('Excluir movimentação', 'Deseja realmente excluir este registro?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: () => removeTransaction(id) }
  ]);
  return (
    <Screen title="Movimentações" subtitle="Todas as suas receitas e despesas">
      {transactions.length === 0
        ? <Text style={{ color: colors.muted }}>Nenhuma movimentação cadastrada ainda.</Text>
        : transactions.map(item => <TransactionCard key={item.id} item={item} onDelete={confirmDelete} />)}
    </Screen>
  );
}
