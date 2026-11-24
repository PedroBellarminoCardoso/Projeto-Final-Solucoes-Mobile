import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FadeValue } from '../components/FadeValue';
import { ExpenseDonut } from '../components/ExpenseDonut';
import { fonts } from '../theme/fonts';
import { Screen } from '../components/Screen';
import { MonthSelector } from '../components/MonthSelector';
import { BalanceCard } from '../components/BalanceCard';
import { Card } from '../components/Card';
import { TransactionCard } from '../components/TransactionCard';
import { useFinance } from '../contexts/FinanceContext';
import { getTotals } from '../utils/calculations';
import { getMonthLongName, isSameMonth } from '../utils/date';
import { formatCurrency } from '../utils/currency';
import { getCategoryMeta } from '../utils/categories';
import { colors } from '../theme/colors';

function formatRange(days: number[], monthLabel: string): string {
  if (days.length === 0) return '';
  const min = String(Math.min(...days)).padStart(2, '0');
  const max = String(Math.max(...days)).padStart(2, '0');
  return min === max
    ? `Gastos do dia ${min} de ${monthLabel}`
    : `Gastos de ${min} a ${max} de ${monthLabel}`;
}

export function HomeScreen({ navigation }: any) {
  const {
    transactions,
    selectedMonth,
    changeMonth,
    categoryBudgets,
    monthlyLimit,
    readNotifications,
    hideValues,
    toggleHideValues
  } = useFinance();

  const monthTransactions = transactions.filter(t => isSameMonth(t.date, selectedMonth));
  const totals = getTotals(monthTransactions);

  const budgetRemaining = Math.max(monthlyLimit - totals.expenses, 0);
  const budgetRatio = monthlyLimit > 0 ? Math.min(totals.expenses / monthlyLimit, 1) : 0;
  const budgetPercent = monthlyLimit > 0 ? (totals.expenses / monthlyLimit) * 100 : 0;

  const categoryTotals: Record<string, number> = {};
  monthTransactions
    .filter(t => t.type === 'expense')
    .forEach(item => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    });

  const categoryBreakdown = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({
      label: name,
      value,
      color: getCategoryMeta(name).color || colors.chartPalette[index % colors.chartPalette.length]
    }));

  // Calcula notificações não lidas para o sino
  const unreadIds: string[] = [];
  Object.entries(categoryBudgets).forEach(([cat, limit]) => {
    const spent = categoryTotals[cat] || 0;
    const pct = limit > 0 ? (spent / limit) * 100 : 0;
    if (pct > 100) unreadIds.push(`exceeded-${cat}`);
    else if (pct >= 85) unreadIds.push(`near-${cat}`);
  });
  const latestIncome = monthTransactions.find(t => t.type === 'income');
  if (latestIncome) unreadIds.push(`income-${latestIncome.id}`);
  const unreadCount = unreadIds.filter(id => !readNotifications.includes(id)).length;

  const recentTransactions = monthTransactions.slice(0, 3);
  const monthLabel = getMonthLongName(selectedMonth).toLowerCase();

  const expenseDays = monthTransactions
    .filter(t => t.type === 'expense')
    .map(t => Number(t.date.split('-')[2]));
  const footnote = `${formatRange(expenseDays, monthLabel)} • ${categoryBreakdown.length} categorias`;


  return (
    <Screen
      overline="CADÊ MEU DINHEIRO?"
      title="Olá, Estudante"
      subtitle="Seu dinheiro, sem complicação."
      rightAction={
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={styles.bellButton}
        >
          <Feather name="bell" size={18} color={colors.primary} />
          {unreadCount > 0 && <View style={styles.bellDot} />}
        </TouchableOpacity>
      }
    >
      <MonthSelector month={selectedMonth} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} />

      <BalanceCard
        balance={totals.balance}
        income={totals.income}
        expenses={totals.expenses}
        monthName={getMonthLongName(selectedMonth)}
        hideValues={hideValues}
        onToggleHide={toggleHideValues}
      />

      <View style={styles.quickRow}>
        <TouchableOpacity
          style={styles.quickExpense}
          onPress={() => navigation.navigate('Adicionar', { initialType: 'expense' })}
        >
          <Feather name="minus" size={16} color="#FFFFFF" />
          <Text style={styles.quickExpenseText}>Nova despesa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickIncome}
          onPress={() => navigation.navigate('Adicionar', { initialType: 'income' })}
        >
          <Feather name="plus" size={16} color={colors.primaryDark} />
          <Text style={styles.quickIncomeText}>Nova receita</Text>
        </TouchableOpacity>
      </View>

      {/* Seu orçamento */}
      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Seu orçamento</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Orçamento')}>
            <Text style={styles.cardLink}>Ver plano</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.budgetMainRow}>
          <FadeValue value={formatCurrency(budgetRemaining)} masked="R$ •••" hidden={hideValues} style={styles.budgetAmount} />
          <Text style={styles.budgetSuffix}>para este mês</Text>
        </View>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${budgetRatio * 100}%`,
                backgroundColor:
                  budgetPercent > 100
                    ? colors.expense
                    : budgetPercent >= 85
                      ? colors.warningBright
                      : colors.primary
              }
            ]}
          />
        </View>
        <View style={styles.budgetFooter}>
          <View style={styles.budgetFooterValues}>
            <FadeValue value={formatCurrency(totals.expenses)} masked="R$ •••" hidden={hideValues} style={styles.mutedSmall} />
            <Text style={styles.mutedSmall}> de </Text>
            <FadeValue value={formatCurrency(monthlyLimit)} masked="R$ •••" hidden={hideValues} style={styles.mutedSmall} />
            <Text style={styles.mutedSmall}> usados</Text>
          </View>
          <Text style={[styles.percentText, budgetPercent > 100 && { color: colors.expense }]}>
            {budgetPercent.toFixed(1).replace('.', ',')}%
          </Text>
        </View>
      </Card>

      {/* Para onde foi? */}
      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Para onde foi?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
            <Text style={styles.cardLink}>Categorias</Text>
          </TouchableOpacity>
        </View>

        {categoryBreakdown.length === 0 ? (
          <Text style={styles.emptyCategoryText}>Nenhuma despesa registrada em {monthLabel}.</Text>
        ) : (
          <ExpenseDonut slices={categoryBreakdown} total={totals.expenses} hidden={hideValues} />
        )}

        <Text style={styles.cardFootnote}>{footnote}</Text>
      </Card>

      {/* Últimas movimentações */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Últimas movimentações</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Extrato')}>
          <Text style={styles.cardLink}>Ver extrato</Text>
        </TouchableOpacity>
      </View>

      {recentTransactions.length === 0 ? (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyIconCircle}>
            <Feather name="credit-card" size={22} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Seu dinheiro começa aqui</Text>
          <Text style={styles.emptyText}>
            Adicione sua primeira receita ou despesa para acompanhar seu saldo e metas.
          </Text>
        </Card>
      ) : (
        <View style={styles.groupedList}>
          {recentTransactions.map((item, index) => (
            <TransactionCard
              key={item.id}
              item={item}
              hideValues={hideValues}
              grouped
              showDivider={index < recentTransactions.length - 1}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.softPurple,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bellDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 9,
    right: 9,
    borderWidth: 1.5,
    borderColor: colors.softPurple
  },
  quickRow: {
    flexDirection: 'row',
    marginBottom: 14
  },
  quickExpense: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5
  },
  quickExpenseText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 13.5,
    marginLeft: 6
  },
  quickIncome: {
    flex: 1,
    backgroundColor: colors.softPurple,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5
  },
  quickIncomeText: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 13.5,
    marginLeft: 6
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.text
  },
  cardLink: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
    color: colors.primary
  },
  budgetMainRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12
  },
  budgetAmount: {
    fontSize: 22,
    fontFamily: fonts.regular,
    color: colors.text,
    marginRight: 6
  },
  budgetSuffix: {
    fontSize: 12.5,
    fontFamily: fonts.regular,
    color: colors.muted
  },
  track: {
    height: 8,
    borderRadius: 6,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden'
  },
  fill: {
    height: 8,
    borderRadius: 6
  },
  budgetFooterValues: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  budgetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  mutedSmall: {
    fontSize: 11.5,
    fontFamily: fonts.regular,
    color: colors.muted
  },
  percentText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.primary
  },
  emptyCategoryText: {
    color: colors.muted,
    fontSize: 13,
    fontFamily: fonts.regular,
    paddingVertical: 6
  },
  cardFootnote: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.muted,
    marginTop: 8
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 10
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15.5,
    fontFamily: fonts.bold
  },
  groupedList: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden'
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.softPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15
  },
  emptyText: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    fontSize: 13,
    fontFamily: fonts.regular,
    lineHeight: 19
  }
});
