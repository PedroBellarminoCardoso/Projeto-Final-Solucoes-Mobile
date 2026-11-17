import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { MonthSelector } from '../components/MonthSelector';
import { Card } from '../components/Card';
import { useFinance } from '../contexts/FinanceContext';
import { getTotals } from '../utils/calculations';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/currency';
import { getCategoryMeta } from '../utils/categories';
import { getMonthLongName, getMonthShortName, isSameMonth, shiftMonth } from '../utils/date';

export function ReportsScreen({ navigation }: any) {
  const { transactions, selectedMonth, changeMonth, hideValues } = useFinance();

  const monthTransactions = transactions.filter(t => isSameMonth(t.date, selectedMonth));
  const totals = getTotals(monthTransactions);

  const categoryTotals: Record<string, number> = {};
  monthTransactions
    .filter(t => t.type === 'expense')
    .forEach(item => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    });

  const categoryEntries = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], idx) => ({
      label: name,
      value,
      color: getCategoryMeta(name).color || colors.chartPalette[idx % colors.chartPalette.length]
    }));

  const topCategory = categoryEntries[0];

  const monthlySeries = [-2, -1, 0].map(offset => {
    const m = shiftMonth(selectedMonth, offset);
    const mTx = transactions.filter(t => isSameMonth(t.date, m));
    const mTotals = getTotals(mTx);
    return {
      label: getMonthShortName(m),
      income: mTotals.income,
      expenses: mTotals.expenses
    };
  });

  const maxBarValue = Math.max(1, ...monthlySeries.flatMap(m => [m.income, m.expenses]));

  const recurringSum = monthTransactions
    .filter(t => t.type === 'expense' && t.category === 'Assinaturas')
    .reduce((s, t) => s + t.amount, 0);

  const mask = (v: number) => (hideValues ? 'R$ •••' : formatCurrency(v));

  return (
    <Screen
      title="Relatórios"
      subtitle="Mais clareza para as próximas escolhas."
      onBack={() => navigation.goBack()}
    >
      <MonthSelector month={selectedMonth} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} />

      {/* Card roxo resumo */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroOverline}>Seu mês em uma conta</Text>
          <View style={styles.heroBadge}>
            <Feather name="trending-up" size={14} color="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.heroValue}>
          {totals.balance >= 0 ? '+ ' : ''}
          {mask(totals.balance)}
        </Text>
        <Text style={styles.heroFormula}>
          {mask(totals.income)} em receitas − {mask(totals.expenses)} em despesas
        </Text>
      </View>

      {/* Distribuição dos gastos */}
      <Card title="Distribuição dos gastos">
        {categoryEntries.length === 0 ? (
          <Text style={styles.emptyText}>Ainda não há despesas neste mês para analisar.</Text>
        ) : (
          <View>
            {categoryEntries.map(slice => {
              const pct = totals.expenses > 0 ? (slice.value / totals.expenses) * 100 : 0;
              return (
                <View key={slice.label} style={styles.distRow}>
                  <View style={styles.distLabelRow}>
                    <View style={styles.legendLeft}>
                      <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
                      <Text style={styles.legendName}>{slice.label}</Text>
                    </View>
                    <Text style={styles.legendPct}>
                      {mask(slice.value)} ({pct.toFixed(1).replace('.', ',')}%)
                    </Text>
                  </View>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${pct}%`, backgroundColor: slice.color }]} />
                  </View>
                </View>
              );
            })}

            {!!topCategory && (
              <View style={styles.highlightPill}>
                <View style={styles.highlightIcon}>
                  <Feather
                    name={getCategoryMeta(topCategory.label).icon as any}
                    size={15}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.highlightTextBlock}>
                  <Text style={styles.highlightTitle}>
                    {topCategory.label} • {mask(topCategory.value)}
                  </Text>
                  <Text style={styles.highlightSub}>
                    {((topCategory.value / (totals.expenses || 1)) * 100).toFixed(1).replace('.', ',')}% dos gastos • Maior categoria
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </Card>

      {/* Seu ritmo nos meses */}
      <Card title="Seu ritmo nos meses">
        <View style={styles.rhythmLegendRow}>
          <View style={styles.rhythmLegendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.income }]} />
            <Text style={styles.rhythmLegendText}>Receitas</Text>
          </View>
          <View style={styles.rhythmLegendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.rhythmLegendText}>Despesas</Text>
          </View>
        </View>

        <View style={styles.rhythmSummaryBox}>
          <View style={styles.rhythmSummaryCol}>
            <Text style={styles.rhythmSummaryOverline}>
              {getMonthLongName(selectedMonth).toUpperCase()} • RECEITAS
            </Text>
            <Text style={styles.rhythmSummaryValue}>{mask(totals.income)}</Text>
          </View>
          <View style={styles.rhythmSummaryCol}>
            <Text style={styles.rhythmSummaryOverline}>DESPESAS</Text>
            <Text style={styles.rhythmSummaryValue}>{mask(totals.expenses)}</Text>
          </View>
        </View>

        <View style={styles.barChartContainer}>
          {monthlySeries.map((point, index) => {
            const incomeHeight = Math.max((point.income / maxBarValue) * 110, point.income > 0 ? 8 : 3);
            const expenseHeight = Math.max((point.expenses / maxBarValue) * 110, point.expenses > 0 ? 8 : 3);
            const isCurrent = index === 2;
            return (
              <View key={point.label} style={styles.barGroup}>
                <View style={styles.barsPair}>
                  <View style={[styles.bar, { height: incomeHeight, backgroundColor: '#56AE8E' }]} />
                  <View style={[styles.bar, { height: expenseHeight, backgroundColor: colors.primary }]} />
                </View>
                <Text style={[styles.barMonthLabel, isCurrent && styles.barMonthLabelActive]}>
                  {point.label}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Insights */}
      <Text style={styles.insightsHeading}>O que os números contam</Text>

      <View style={styles.insightPurpleCard}>
        <View style={styles.insightIconBox}>
          <Feather name="pie-chart" size={16} color={colors.primary} />
        </View>
        <View style={styles.insightBody}>
          <Text style={styles.insightTitlePurple}>
            {topCategory ? `${topCategory.label} lidera seus gastos` : 'Comece registrando seus gastos'}
          </Text>
          <Text style={styles.insightDesc}>
            {topCategory
              ? `${topCategory.label} soma ${mask(topCategory.value)} neste mês (${((topCategory.value / (totals.expenses || 1)) * 100).toFixed(1).replace('.', ',')}% das despesas).`
              : 'Adicione lançamentos em Despesas para receber recomendações personalizadas.'}
          </Text>
        </View>
      </View>

      <View style={styles.insightAmberCard}>
        <View style={styles.insightIconBox}>
          <Feather name="repeat" size={16} color={colors.warning} />
        </View>
        <View style={styles.insightBody}>
          <Text style={styles.insightTitleAmber}>
            {recurringSum > 0
              ? `${mask(recurringSum)} em gastos recorrentes`
              : 'De olho nas assinaturas'}
          </Text>
          <Text style={styles.insightDesc}>
            {recurringSum > 0
              ? 'Reveja suas assinaturas do mês para avaliar o que ainda faz sentido para você.'
              : 'Agrupar serviços mensais na categoria Assinaturas ajuda a controlar cobranças recorrentes.'}
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  heroOverline: {
    color: '#E6DCFF',
    fontSize: 12.5,
    fontWeight: '600'
  },
  heroBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 4
  },
  heroFormula: {
    color: '#DFD2FF',
    fontSize: 12
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13
  },
  distRow: {
    marginBottom: 12
  },
  distLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7
  },
  legendName: {
    fontSize: 12.5,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  legendPct: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text
  },
  track: {
    height: 7,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 6,
    overflow: 'hidden'
  },
  fill: {
    height: 7,
    borderRadius: 6
  },
  highlightPill: {
    marginTop: 6,
    backgroundColor: colors.softPurpleLight,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  highlightIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  highlightTextBlock: {
    flex: 1
  },
  highlightTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.primaryDark
  },
  highlightSub: {
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 1
  },
  rhythmLegendRow: {
    flexDirection: 'row',
    marginBottom: 10
  },
  rhythmLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16
  },
  rhythmLegendText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  rhythmSummaryBox: {
    backgroundColor: colors.softPurple,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    marginBottom: 16
  },
  rhythmSummaryCol: {
    flex: 1
  },
  rhythmSummaryOverline: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2
  },
  rhythmSummaryValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 145,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8
  },
  barGroup: {
    alignItems: 'center'
  },
  barsPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 115,
    marginBottom: 6
  },
  bar: {
    width: 14,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    marginHorizontal: 3
  },
  barMonthLabel: {
    fontSize: 11.5,
    color: colors.muted,
    fontWeight: '600'
  },
  barMonthLabelActive: {
    color: colors.primary,
    fontWeight: '800'
  },
  insightsHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
    marginBottom: 10
  },
  insightPurpleCard: {
    backgroundColor: colors.softPurple,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    marginBottom: 10
  },
  insightAmberCard: {
    backgroundColor: colors.softAmber,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    marginBottom: 8
  },
  insightIconBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  insightBody: {
    flex: 1
  },
  insightTitlePurple: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.primaryDark,
    marginBottom: 3
  },
  insightTitleAmber: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.warning,
    marginBottom: 3
  },
  insightDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17
  }
});
