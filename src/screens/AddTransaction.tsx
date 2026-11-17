import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFinance } from '../contexts/FinanceContext';
import { TransactionType } from '../types/Transaction';
import { colors } from '../theme/colors';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';
import { formatSlashDate, parseSlashDateToIso } from '../utils/date';

interface FormState {
  type: TransactionType;
  amount: string;
  category: string;
  description: string;
  dateInput: string;
}

export function AddTransactionScreen({ navigation, route }: any) {
  const { addTransaction } = useFinance();
  const routeType: TransactionType = route?.params?.initialType || 'expense';

  const [formData, setFormData] = useState<FormState>({
    type: routeType,
    amount: '',
    category: routeType === 'income' ? INCOME_CATEGORIES[0].name : EXPENSE_CATEGORIES[0].name,
    description: '',
    dateInput: formatSlashDate(new Date().toISOString().slice(0, 10))
  });

  useEffect(() => {
    if (route?.params?.initialType) {
      const nextType: TransactionType = route.params.initialType;
      setFormData({
        ...formData,
        type: nextType,
        category: nextType === 'income' ? INCOME_CATEGORIES[0].name : EXPENSE_CATEGORIES[0].name
      });
    }
  }, [route?.params?.initialType]);

  const handleSwitchType = (nextType: TransactionType) => {
    setFormData({
      ...formData,
      type: nextType,
      category: nextType === 'income' ? INCOME_CATEGORIES[0].name : EXPENSE_CATEGORIES[0].name
    });
  };

  const handleSave = async () => {
    const normalized = formData.amount.trim().replace(/\./g, '').replace(',', '.');
    const value = Number(normalized);

    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert('Atenção', 'Informe um valor válido maior que zero.');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Atenção', 'Informe uma descrição.');
      return;
    }

    const parsedDate = parseSlashDateToIso(formData.dateInput) || new Date().toISOString().slice(0, 10);

    await addTransaction({
      description: formData.description.trim(),
      amount: value,
      type: formData.type,
      category: formData.category,
      date: parsedDate
    });

    Alert.alert('Sucesso', formData.type === 'expense' ? 'Despesa salva!' : 'Receita salva!');
    setFormData({
      ...formData,
      amount: '',
      description: ''
    });
    navigation.navigate('Extrato');
  };

  const isExpense = formData.type === 'expense';
  const availableCategories = isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <Screen
      title={isExpense ? 'Nova despesa' : 'Nova receita'}
      subtitle={isExpense ? 'Anotou, ficou mais fácil cuidar.' : 'Uma entrada a mais, um respiro no mês.'}
      onBack={() => navigation.goBack()}
      rightAction={
        <TouchableOpacity onPress={() => navigation.navigate('Início')} style={styles.closeButton}>
          <Feather name="x" size={18} color={colors.text} />
        </TouchableOpacity>
      }
    >
      {/* Segmented toggle */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          onPress={() => handleSwitchType('expense')}
          style={[styles.segmentBtn, isExpense && styles.segmentBtnActive]}
        >
          <Feather name="arrow-up-right" size={14} color={isExpense ? '#FFFFFF' : colors.muted} />
          <Text style={[styles.segmentText, isExpense && styles.segmentTextActive]}>Despesa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSwitchType('income')}
          style={[styles.segmentBtn, !isExpense && styles.segmentBtnActive]}
        >
          <Feather name="arrow-down-left" size={14} color={!isExpense ? '#FFFFFF' : colors.muted} />
          <Text style={[styles.segmentText, !isExpense && styles.segmentTextActive]}>Receita</Text>
        </TouchableOpacity>
      </View>

      {/* Card de valor */}
      <View style={[styles.amountCard, isExpense ? styles.amountCardExpense : styles.amountCardIncome]}>
        <Text style={[styles.amountPrompt, isExpense ? styles.promptExpense : styles.promptIncome]}>
          {isExpense ? 'Quanto você gastou?' : 'Quanto você recebeu?'}
        </Text>
        <View style={styles.amountInputRow}>
          <Text style={[styles.currencyPrefix, isExpense ? styles.valueExpense : styles.valueIncome]}>R$</Text>
          <TextInput
            value={formData.amount}
            onChangeText={text => setFormData({ ...formData, amount: text })}
            placeholder="0,00"
            placeholderTextColor={isExpense ? '#A88AF2' : '#73BD9E'}
            keyboardType="decimal-pad"
            style={[styles.amountInput, isExpense ? styles.valueExpense : styles.valueIncome]}
          />
        </View>
        <Text style={[styles.amountHint, isExpense ? styles.promptExpense : styles.promptIncome]}>
          Valor em reais
        </Text>
      </View>

      {/* Grade de categorias */}
      <Text style={styles.sectionLabel}>Categoria</Text>
      <View style={styles.categoryGrid}>
        {availableCategories.map(item => {
          const selected = formData.category === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => setFormData({ ...formData, category: item.name })}
              style={[
                styles.categoryTile,
                !isExpense && styles.categoryTileTwoCol,
                selected && styles.categoryTileSelected
              ]}
            >
              <Feather
                name={item.icon as any}
                size={18}
                color={selected ? colors.primary : colors.muted}
              />
              <Text style={[styles.categoryLabel, selected && styles.categoryLabelSelected]} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Descrição */}
      <Text style={styles.sectionLabel}>Descrição</Text>
      <TextInput
        value={formData.description}
        onChangeText={text => setFormData({ ...formData, description: text })}
        placeholder={isExpense ? 'Ex.: Lanche no intervalo' : 'Ex.: Ajuda para os materiais da faculdade'}
        placeholderTextColor={colors.muted}
        style={styles.input}
      />

      {/* Data */}
      <Text style={styles.sectionLabel}>{isExpense ? 'Data da despesa' : 'Data da receita'}</Text>
      <View style={styles.dateInputBox}>
        <TextInput
          value={formData.dateInput}
          onChangeText={text => setFormData({ ...formData, dateInput: text })}
          placeholder="DD/MM/AAAA"
          placeholderTextColor={colors.muted}
          style={styles.dateInput}
        />
        <Feather name="calendar" size={16} color={colors.primary} />
      </View>

      <View style={styles.draftRow}>
        <Feather name="info" size={13} color={colors.muted} />
        <Text style={styles.draftText}>Rascunho • Ainda não incluído no seu saldo.</Text>
      </View>

      <PrimaryButton
        title={isExpense ? 'Salvar despesa' : 'Salvar receita'}
        icon="check"
        onPress={handleSave}
      />

      <View style={styles.securityRow}>
        <Feather name="lock" size={11} color={colors.muted} />
        <Text style={styles.securityText}>Suas finanças são pessoais. Cuide dos seus dados.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.softPurple,
    alignItems: 'center',
    justifyContent: 'center'
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    padding: 4,
    marginBottom: 14
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12
  },
  segmentBtnActive: {
    backgroundColor: colors.primary
  },
  segmentText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.muted,
    marginLeft: 6
  },
  segmentTextActive: {
    color: '#FFFFFF'
  },
  amountCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16
  },
  amountCardExpense: {
    backgroundColor: colors.softPurple
  },
  amountCardIncome: {
    backgroundColor: colors.softGreen
  },
  amountPrompt: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6
  },
  promptExpense: {
    color: colors.primaryDark
  },
  promptIncome: {
    color: colors.incomeDark
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '800',
    marginRight: 6
  },
  amountInput: {
    flex: 1,
    fontSize: 34,
    fontWeight: '800',
    paddingVertical: 2
  },
  valueExpense: {
    color: colors.primary
  },
  valueIncome: {
    color: colors.incomeDark
  },
  amountHint: {
    fontSize: 11,
    marginTop: 4
  },
  sectionLabel: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 4
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  categoryTile: {
    width: '31.5%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 8
  },
  categoryTileTwoCol: {
    width: '48.5%'
  },
  categoryTileSelected: {
    backgroundColor: colors.softPurpleLight,
    borderColor: colors.primary,
    borderWidth: 1.5
  },
  categoryLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 6
  },
  categoryLabelSelected: {
    color: colors.primaryDark,
    fontWeight: '700'
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 14,
    marginBottom: 14
  },
  dateInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12
  },
  dateInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text
  },
  draftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  draftText: {
    fontSize: 11.5,
    color: colors.muted,
    marginLeft: 6
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12
  },
  securityText: {
    fontSize: 11,
    color: colors.muted,
    marginLeft: 5
  }
});
