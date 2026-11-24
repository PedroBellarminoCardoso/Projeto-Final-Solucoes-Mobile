import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Transaction } from '../types/Transaction';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/currency';
import { getCategoryMeta } from '../utils/categories';
import { formatShortDayMonth } from '../utils/date';
import { FadeValue } from './FadeValue';
import { fonts } from '../theme/fonts';

interface TransactionCardProps {
  item: Transaction;
  onDelete?: (id: string) => void;
  hideValues?: boolean;
  grouped?: boolean;
  showDivider?: boolean;
}

export function TransactionCard({
  item,
  onDelete,
  hideValues = false,
  grouped = false,
  showDivider = false
}: TransactionCardProps) {
  const isIncome = item.type === 'income';
  const meta = getCategoryMeta(item.category);

  return (
    <View style={[grouped ? styles.groupedRow : styles.card, showDivider && styles.dividerBottom]}>
      <View style={[styles.iconBox, { backgroundColor: isIncome ? colors.softGreen : colors.softPurple }]}>
        <Feather
          name={meta.icon as any}
          size={17}
          color={isIncome ? colors.income : colors.primary}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.description}
        </Text>
        <Text style={styles.meta}>
          {item.category} • {formatShortDayMonth(item.date)}
        </Text>
      </View>

      <View style={styles.amountArea}>
        <FadeValue
          value={`${isIncome ? '+' : '-'} ${formatCurrency(item.amount)}`}
          masked="•••"
          hidden={hideValues}
          style={[styles.amount, { color: isIncome ? colors.income : colors.text }]}
        />
        {!!onDelete && (
          <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
            <Feather name="trash-2" size={12} color={colors.muted} />
            <Text style={styles.delete}>Excluir</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  groupedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  dividerBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8
  },
  name: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 13.5
  },
  meta: {
    color: colors.muted,
    fontSize: 11.5,
    marginTop: 2,
    fontFamily: fonts.regular
  },
  amountArea: {
    alignItems: 'flex-end'
  },
  amount: {
    fontSize: 13.5,
    fontFamily: fonts.regular
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  delete: {
    color: colors.muted,
    fontSize: 11,
    marginLeft: 3,
    fontFamily: fonts.regular
  },
});
