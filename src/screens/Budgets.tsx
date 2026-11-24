import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { MonthSelector } from '../components/MonthSelector';
import { Card } from '../components/Card';
import { useFinance } from '../contexts/FinanceContext';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/currency';
import { EXPENSE_CATEGORIES, getCategoryMeta } from '../utils/categories';
import { isSameMonth } from '../utils/date';
import { fonts } from '../theme/fonts';

export function BudgetsScreen({ navigation }: any) {
  const {
    transactions,
    selectedMonth,
    changeMonth,
    categoryBudgets,
    monthlyLimit,
    updateCategoryBudget,
    updateMonthlyLimit,
    hideValues
  } = useFinance();

  const [editingOverall, setEditingOverall] = useState(false);
  const [overallDraft, setOverallDraft] = useState(String(monthlyLimit));
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState('');

  const monthExpenses = transactions.filter(
    t => t.type === 'expense' && isSameMonth(t.date, selectedMonth)
  );
  const totalSpent = monthExpenses.reduce((sum, item) => sum + item.amount, 0);

  const spentByCategory: Record<string, number> = {};
  monthExpenses.forEach(item => {
    spentByCategory[item.category] = (spentByCategory[item.category] || 0) + item.amount;
  });

  const overallRatio = monthlyLimit > 0 ? Math.min(totalSpent / monthlyLimit, 1) : 0;
  const overallPercent = monthlyLimit > 0 ? (totalSpent / monthlyLimit) * 100 : 0;
  const overallRemaining = monthlyLimit - totalSpent;

  const categoryNames = Array.from(
    new Set([
      ...Object.keys(categoryBudgets),
      ...EXPENSE_CATEGORIES.slice(0, 6).map(c => c.name)
    ])
  );

  const categoryRows = categoryNames.map(name => {
    const limit = categoryBudgets[name] ?? 200;
    const spent = spentByCategory[name] ?? 0;
    const percent = limit > 0 ? (spent / limit) * 100 : 0;
    return { name, limit, spent, percent };
  });

  const exceededCat = categoryRows.find(c => c.percent > 100);
  const nearCat = categoryRows.find(c => c.percent >= 85 && c.percent <= 100);
  const alertCategory = exceededCat
    ? { ...exceededCat, status: 'exceeded' as const }
    : nearCat
      ? { ...nearCat, status: 'near' as const }
      : null;

  const handleSaveOverall = async () => {
    const parsed = Number(overallDraft.replace(/\./g, '').replace(',', '.'));
    if (Number.isFinite(parsed) && parsed > 0) {
      await updateMonthlyLimit(parsed);
    }
    setEditingOverall(false);
  };

  const handleSaveCategory = async (name: string) => {
    const parsed = Number(categoryDraft.replace(/\./g, '').replace(',', '.'));
    if (Number.isFinite(parsed) && parsed > 0) {
      await updateCategoryBudget(name, parsed);
    }
    setEditingCategory(null);
  };

  const mask = (v: number) => (hideValues ? 'R$ •••' : formatCurrency(v));
  const sumCategoryLimits = categoryRows.reduce((s, c) => s + c.limit, 0);

  return (
    <Screen
      title="Orçamento"
      subtitle="Um plano que cabe na vida de estudante."
      onBack={() => navigation.goBack()}
    >
      <MonthSelector month={selectedMonth} onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} />

      {/* Limite geral do mês */}
      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.caption}>Limite geral do mês</Text>
          <TouchableOpacity
            onPress={() => {
              setOverallDraft(String(monthlyLimit));
              setEditingOverall(!editingOverall);
            }}
            style={styles.editLink}
          >
            <Feather name="edit-2" size={12} color={colors.primary} />
            <Text style={styles.editLinkText}>{editingOverall ? 'Cancelar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.mainAmount}>{mask(monthlyLimit)}</Text>

        {editingOverall && (
          <View style={styles.inlineEditor}>
            <Text style={styles.inlineEditorLabel}>Novo limite mensal (R$)</Text>
            <View style={styles.inlineEditorRow}>
              <TextInput
                value={overallDraft}
                onChangeText={setOverallDraft}
                keyboardType="decimal-pad"
                style={styles.inlineInput}
              />
              <TouchableOpacity onPress={handleSaveOverall} style={styles.confirmBtn}>
                <Text style={styles.confirmBtnText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${overallRatio * 100}%`,
                backgroundColor:
                  overallPercent > 100
                    ? colors.expense
                    : overallPercent >= 85
                      ? colors.warningBright
                      : colors.primary
              }
            ]}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.mutedSmall}>{mask(totalSpent)} usados</Text>
          <Text style={[styles.percentBadge, overallPercent > 100 && { color: colors.expense }]}>
            {overallPercent.toFixed(1).replace('.', ',')}%
          </Text>
        </View>

        <View style={styles.availablePill}>
          <Text style={styles.availableLabel}>
            {overallRemaining >= 0 ? 'Ainda dá para usar' : 'Limite excedido em'}
          </Text>
          <Text style={[styles.availableValue, overallRemaining < 0 && { color: colors.expense }]}>
            {mask(Math.abs(overallRemaining))}
          </Text>
        </View>
      </Card>

      {/* Banner de atenção */}
      {!!alertCategory && (
        <View style={styles.alertBanner}>
          <Feather
            name="alert-triangle"
            size={17}
            color={alertCategory.status === 'exceeded' ? colors.expense : colors.warning}
          />
          <View style={styles.alertTextBlock}>
            <Text
              style={[
                styles.alertTitle,
                alertCategory.status === 'exceeded' && { color: colors.expense }
              ]}
            >
              {alertCategory.status === 'exceeded'
                ? `${alertCategory.name} passou do limite`
                : `${alertCategory.name} está perto do limite`}
            </Text>
            <Text style={styles.alertBody}>
              {alertCategory.status === 'exceeded'
                ? `Você usou ${Math.round(alertCategory.percent)}% do previsto (${mask(alertCategory.spent - alertCategory.limit)} acima).`
                : `Você usou ${Math.round(alertCategory.percent)}% do previsto. Restam ${mask(Math.max(alertCategory.limit - alertCategory.spent, 0))} nesta categoria.`}
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Planejamento por categoria</Text>

      {categoryRows.map(item => {
        const meta = getCategoryMeta(item.name);
        const isExceeded = item.percent > 100;
        const isNear = item.percent >= 85 && !isExceeded;
        const barColor = isExceeded ? colors.expense : isNear ? colors.warning : colors.primary;
        const isEditing = editingCategory === item.name;
        const remaining = item.limit - item.spent;

        return (
          <Card key={item.name} style={styles.catCard}>
            <View style={styles.catHeader}>
              <View style={styles.catNameRow}>
                <View style={styles.catIconBox}>
                  <Feather name={meta.icon as any} size={14} color={colors.primary} />
                </View>
                <Text style={styles.catName}>{item.name}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setCategoryDraft(String(item.limit));
                  setEditingCategory(isEditing ? null : item.name);
                }}
                style={styles.catEditBtn}
              >
                <Feather name={isEditing ? 'x' : 'edit-2'} size={14} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.catNumbersRow}>
              <Text style={styles.catSpent}>
                {mask(item.spent)} <Text style={styles.catLimitMuted}>de {mask(item.limit)}</Text>
              </Text>
              <Text style={[styles.catPct, { color: barColor }]}>
                {Math.round(item.percent)}%
              </Text>
            </View>

            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${Math.min(item.percent, 100)}%`,
                    backgroundColor: barColor
                  }
                ]}
              />
            </View>

            <Text style={[styles.catStatusText, isExceeded && { color: colors.expense }]}>
              {remaining >= 0
                ? `Restam ${mask(remaining)}`
                : `Limite excedido em ${mask(Math.abs(remaining))}`}
            </Text>

            {isEditing && (
              <View style={styles.inlineEditor}>
                <Text style={styles.inlineEditorLabel}>Ajustar limite de {item.name}</Text>
                <View style={styles.inlineEditorRow}>
                  <TextInput
                    value={categoryDraft}
                    onChangeText={setCategoryDraft}
                    keyboardType="decimal-pad"
                    style={styles.inlineInput}
                  />
                  <TouchableOpacity onPress={() => handleSaveCategory(item.name)} style={styles.confirmBtn}>
                    <Text style={styles.confirmBtnText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Card>
        );
      })}

      <Text style={styles.bottomNote}>
        Limites das categorias somam {mask(sumCategoryLimits)}.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  caption: {
    color: colors.muted,
    fontSize: 12.5,
    fontFamily: fonts.bold
  },
  editLink: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  editLinkText: {
    fontSize: 12.5,
    fontFamily: fonts.bold,
    color: colors.primary,
    marginLeft: 5
  },
  mainAmount: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 28,
    marginTop: 6,
    marginBottom: 14
  },
  track: {
    height: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 6,
    overflow: 'hidden'
  },
  fill: {
    height: 8,
    borderRadius: 6
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9
  },
  mutedSmall: {
    color: colors.muted,
    fontSize: 12,
    fontFamily: fonts.regular
  },
  percentBadge: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.primary
  },
  availablePill: {
    marginTop: 14,
    backgroundColor: colors.softPurple,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  availableLabel: {
    fontSize: 12.5,
    color: colors.primaryDark,
    fontFamily: fonts.bold
  },
  availableValue: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.primaryDark
  },
  alertBanner: {
    backgroundColor: colors.softAmber,
    borderWidth: 1,
    borderColor: colors.softAmberBorder,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    marginBottom: 16
  },
  alertTextBlock: {
    flex: 1,
    marginLeft: 10
  },
  alertTitle: {
    fontSize: 13.5,
    fontFamily: fonts.bold,
    color: colors.warning,
    marginBottom: 3
  },
  alertBody: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    fontFamily: fonts.regular
  },
  sectionTitle: {
    fontSize: 15.5,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: 10
  },
  catCard: {
    marginBottom: 10,
    padding: 15
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  catNameRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  catIconBox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: colors.softPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  catName: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: colors.text
  },
  catEditBtn: {
    padding: 4
  },
  catNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7
  },
  catSpent: {
    fontSize: 12.5,
    fontFamily: fonts.regular,
    color: colors.text
  },
  catLimitMuted: {
    fontFamily: fonts.regular,
    color: colors.muted
  },
  catPct: {
    fontSize: 12.5,
    fontFamily: fonts.regular
  },
  catStatusText: {
    fontSize: 11.5,
    color: colors.primary,
    fontFamily: fonts.bold,
    marginTop: 7
  },
  inlineEditor: {
    marginTop: 12,
    backgroundColor: colors.softPurple,
    borderRadius: 14,
    padding: 12
  },
  inlineEditorLabel: {
    fontSize: 11.5,
    fontFamily: fonts.bold,
    color: colors.primaryDark,
    marginBottom: 8
  },
  inlineEditorRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  inlineInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.softPurpleBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.text,
    marginRight: 8
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontFamily: fonts.bold
  },
  bottomNote: {
    textAlign: 'center',
    fontSize: 11.5,
    color: colors.muted,
    marginTop: 8,
    fontFamily: fonts.regular
  },
});
