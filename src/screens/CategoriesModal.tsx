import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { MonthSelector } from '../components/MonthSelector';
import { Card } from '../components/Card';
import { useFinance } from '../contexts/FinanceContext';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/currency';
import { getCategoryMeta } from '../utils/categories';
import { isSameMonth } from '../utils/date';

export function CategoriesScreen({ navigation }: any) {
  const { transactions, selectedMonth, changeMonth, hideValues } = useFinance();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const monthExpenses = transactions.filter(
    t => t.type === 'expense' && isSameMonth(t.date, selectedMonth)
  );
  const totalExpenses = monthExpenses.reduce((sum, item) => sum + item.amount, 0);

  const map: Record<string, { total: number; count: number }> = {};
  monthExpenses.forEach(item => {
    if (!map[item.category]) map[item.category] = { total: 0, count: 0 };
    map[item.category].total += item.amount;
    map[item.category].count += 1;
  });

  const categories = Object.entries(map)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([name, info], idx) => {
      const meta = getCategoryMeta(name);
      return {
        name,
        total: info.total,
        count: info.count,
        percent: totalExpenses > 0 ? (info.total / totalExpenses) * 100 : 0,
        average: info.count > 0 ? info.total / info.count : 0,
        color: meta.color || colors.chartPalette[idx % colors.chartPalette.length],
        icon: meta.icon
      };
    });

  const mask = (v: number) => (hideValues ? 'R$ •••' : formatCurrency(v));

  return (
    <Screen
      title="Categorias"
      subtitle="Entenda o que pesa no seu mês."
      onBack={() => navigation.goBack()}
      rightAction={
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs', { screen: 'Adicionar', params: { initialType: 'expense' } })}
          style={styles.plusButton}
        >
          <Feather name="plus" size={18} color={colors.primary} />
        </TouchableOpacity>
      }
    >
      <MonthSelector month={selectedMonth} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} />

      <Card title="Despesas por categoria">
        <Text style={styles.totalAmount}>{mask(totalExpenses)}</Text>
        <View style={styles.chartFooter}>
          <Text style={styles.footerMuted}>
            {monthExpenses.length} {monthExpenses.length === 1 ? 'despesa registrada' : 'despesas registradas'}
          </Text>
          <Text style={styles.footerPurple}>
            {categories.length} {categories.length === 1 ? 'categoria' : 'categorias'}
          </Text>
        </View>

        {categories.length > 0 && (
          <View style={styles.stackedBar}>
            {categories.map(cat => (
              <View
                key={cat.name}
                style={[styles.stackedSegment, { flex: Math.max(cat.percent, 4), backgroundColor: cat.color }]}
              />
            ))}
          </View>
        )}
      </Card>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Seus gastos</Text>
        <Text style={styles.sortLabel}>Maior valor ↓</Text>
      </View>

      {categories.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nenhuma despesa registrada neste mês.</Text>
        </Card>
      ) : (
        categories.map(cat => {
          const isSelected = selectedCategory === cat.name;
          return (
            <TouchableOpacity
              key={cat.name}
              onPress={() => setSelectedCategory(isSelected ? null : cat.name)}
              style={[styles.catCard, isSelected && styles.catCardSelected]}
            >
              <View style={styles.catTopRow}>
                <View style={styles.catLeft}>
                  <View style={[styles.catIconBox, isSelected && styles.catIconBoxSelected]}>
                    <Feather name={cat.icon as any} size={16} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.catName}>{cat.name}</Text>
                    <View style={styles.catMetaRow}>
                      <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                      <Text style={styles.catMeta}>
                        {cat.count} {cat.count === 1 ? 'lançamento' : 'lançamentos'} • {cat.percent.toFixed(1).replace('.', ',')}%
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.catRight}>
                  <Text style={styles.catTotal}>{mask(cat.total)}</Text>
                  <Feather name="chevron-right" size={14} color={colors.muted} />
                </View>
              </View>

              {isSelected && (
                <View style={styles.catExpandedFooter}>
                  <Text style={styles.expandedPurple}>Em destaque</Text>
                  <Text style={styles.expandedAvg}>Média de {mask(cat.average)}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  plusButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.softPurple,
    alignItems: 'center',
    justifyContent: 'center'
  },
  totalAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  footerMuted: {
    fontSize: 12,
    color: colors.muted
  },
  footerPurple: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary
  },
  stackedBar: {
    height: 9,
    borderRadius: 5,
    overflow: 'hidden',
    flexDirection: 'row'
  },
  stackedSegment: {
    height: 9,
    borderRadius: 3,
    marginRight: 2
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 22
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13
  },
  catCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10
  },
  catCardSelected: {
    backgroundColor: colors.softPurpleLight,
    borderColor: colors.primary,
    borderWidth: 1.5
  },
  catTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  catIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.softPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11
  },
  catIconBoxSelected: {
    backgroundColor: colors.surface
  },
  catName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text
  },
  catMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  catDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5
  },
  catMeta: {
    fontSize: 11.5,
    color: colors.muted
  },
  catRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  catTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginRight: 5
  },
  catExpandedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.softPurpleBorder
  },
  expandedPurple: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary
  },
  expandedAvg: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.primaryDark
  }
});
