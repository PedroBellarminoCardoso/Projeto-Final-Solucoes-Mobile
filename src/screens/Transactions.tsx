import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MonthSelector } from '../components/MonthSelector';
import { Card } from '../components/Card';
import { TransactionCard } from '../components/TransactionCard';
import { useFinance } from '../contexts/FinanceContext';
import { colors } from '../theme/colors';
import { getTotals } from '../utils/calculations';
import { formatCurrency } from '../utils/currency';
import { getMonthLongName, isSameMonth } from '../utils/date';
import { Transaction } from '../types/Transaction';
import { fonts } from '../theme/fonts';

type FilterType = 'all' | 'income' | 'expense';

export function TransactionsScreen({ navigation }: any) {
  const { transactions, removeTransaction, selectedMonth, changeMonth, hideValues } = useFinance();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const confirmDelete = (id: string) => {
    Alert.alert('Excluir movimentação', 'Deseja realmente excluir este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => removeTransaction(id) }
    ]);
  };

  const monthTransactions = transactions.filter(t => isSameMonth(t.date, selectedMonth));
  const monthTotals = getTotals(monthTransactions);

  const filteredTransactions = monthTransactions.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredTotals = getTotals(filteredTransactions);
  const mask = (v: number) => (hideValues ? 'R$ •••' : formatCurrency(v));

  const renderHeader = () => (
    <View>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Extrato</Text>
            <Text style={styles.subtitle}>Cada movimento conta.</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setSearchOpen(!searchOpen)}
          style={styles.searchButton}
        >
          <Feather name={searchOpen ? 'x' : 'search'} size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {searchOpen && (
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color={colors.muted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar por descrição ou categoria..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
          />
        </View>
      )}

      <MonthSelector month={selectedMonth} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} />

      <Card>
        <View style={styles.summaryTopRow}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabelGreen}>↙ Receitas</Text>
            <Text style={styles.summaryValue}>{mask(monthTotals.income)}</Text>
          </View>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabelRed}>↗ Despesas</Text>
            <Text style={styles.summaryValue}>{mask(monthTotals.expenses)}</Text>
          </View>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryBottomRow}>
          <Text style={styles.summaryMeta}>
            Resultado de {getMonthLongName(selectedMonth).toLowerCase()}
          </Text>
          <Text style={[styles.summaryResult, monthTotals.balance < 0 && { color: colors.expense }]}>
            {monthTotals.balance >= 0 ? '+ ' : ''}
            {mask(monthTotals.balance)}
          </Text>
        </View>
      </Card>

      <View style={styles.chipsRow}>
        {(
          [
            { key: 'all', label: 'Todos' },
            { key: 'income', label: 'Receitas' },
            { key: 'expense', label: 'Despesas' }
          ] as { key: FilterType; label: string }[]
        ).map(chip => {
          const active = filterType === chip.key;
          return (
            <TouchableOpacity
              key={chip.key}
              onPress={() => setFilterType(chip.key)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{getMonthLongName(selectedMonth)}, até agora</Text>
        <Text style={styles.listCount}>
          {filteredTransactions.length} {filteredTransactions.length === 1 ? 'lançamento' : 'lançamentos'}
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (filteredTransactions.length === 0) return null;
    return (
      <View style={styles.footerSummary}>
        <View style={styles.footerRow}>
          <Text style={styles.footerMuted}>Entradas no filtro</Text>
          <Text style={styles.footerMuted}>{mask(filteredTotals.income)}</Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.footerPurpleLabel}>Saldo no período</Text>
          <Text style={styles.footerPurpleValue}>{mask(filteredTotals.balance)}</Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList<Transaction>
      style={styles.container}
      contentContainerStyle={styles.content}
      data={filteredTransactions}
      keyExtractor={item => item.id}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={
        <Card style={styles.emptyCard}>
          <Feather name="inbox" size={26} color={colors.primary} />
          <Text style={styles.emptyTitle}>Nenhum lançamento encontrado</Text>
          <Text style={styles.emptySubtitle}>
            Suas receitas e despesas filtradas aparecerão aqui.
          </Text>
        </Card>
      }
      renderItem={({ item }) => (
        <TransactionCard
          item={item}
          onDelete={confirmDelete}
          hideValues={hideValues}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
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
    alignItems: 'center'
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
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
  searchButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.softPurple,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 12
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: colors.text,
    marginLeft: 8,
    fontFamily: fonts.regular
  },
  summaryTopRow: {
    flexDirection: 'row'
  },
  summaryCol: {
    flex: 1
  },
  summaryLabelGreen: {
    fontSize: 11.5,
    fontFamily: fonts.regular,
    color: colors.income,
    marginBottom: 4
  },
  summaryLabelRed: {
    fontSize: 11.5,
    fontFamily: fonts.regular,
    color: colors.expense,
    marginBottom: 4
  },
  summaryValue: {
    fontSize: 17,
    fontFamily: fonts.regular,
    color: colors.text
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12
  },
  summaryBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  summaryMeta: {
    fontSize: 12,
    color: colors.muted,
    fontFamily: fonts.regular
  },
  summaryResult: {
    fontSize: 13.5,
    fontFamily: fonts.regular,
    color: colors.primary
  },
  chipsRow: {
    flexDirection: 'row',
    marginBottom: 14
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  chipText: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
    color: colors.textSecondary
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontFamily: fonts.bold
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  listTitle: {
    fontSize: 14.5,
    fontFamily: fonts.bold,
    color: colors.text
  },
  listCount: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.primary
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 26
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.text
  },
  emptySubtitle: {
    marginTop: 5,
    fontSize: 12.5,
    color: colors.muted,
    textAlign: 'center',
    fontFamily: fonts.regular
  },
  footerSummary: {
    backgroundColor: colors.softPurple,
    borderRadius: 16,
    padding: 14,
    marginTop: 6
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2
  },
  footerMuted: {
    fontSize: 12,
    color: colors.muted,
    fontFamily: fonts.regular
  },
  footerPurpleLabel: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: colors.primaryDark
  },
  footerPurpleValue: {
    fontSize: 14.5,
    fontFamily: fonts.regular,
    color: colors.primaryDark
  }
});
