import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Screen } from '../components/Screen';
import { PrimaryButton } from '../components/PrimaryButton';
import { useFinance } from '../contexts/FinanceContext';
import { TransactionType } from '../types/Transaction';
import { colors } from '../theme/colors';

const categories = ['Alimentação', 'Transporte', 'Educação', 'Moradia', 'Lazer', 'Saúde', 'Salário', 'Outros'];

export function AddTransactionScreen({ onSaved }: { onSaved: () => void }) {
  const { addTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Alimentação');

  const handleSave = async () => {
    const normalized = amount.trim().replace(/\./g, '').replace(',', '.');
    const value = Number(normalized);
    if (!description.trim()) return Alert.alert('Atenção', 'Informe uma descrição.');
    if (!Number.isFinite(value) || value <= 0) return Alert.alert('Atenção', 'Informe um valor válido maior que zero.');
    await addTransaction({ description: description.trim(), amount: value, type, category, date: new Date().toISOString().slice(0, 10) });
    Alert.alert('Sucesso', 'Movimentação salva!');
    setDescription(''); setAmount('');
    onSaved();
  };

  return (
    <Screen title="Nova movimentação" subtitle="Registre para onde vai seu dinheiro">
      <Text style={styles.label}>Tipo de movimentação</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => setType('expense')} style={[styles.typeButton, type === 'expense' && styles.selectedExpense]}><Text style={[styles.typeText, type === 'expense' && styles.selectedText]}>Despesa</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setType('income')} style={[styles.typeButton, type === 'income' && styles.selectedIncome]}><Text style={[styles.typeText, type === 'income' && styles.selectedText]}>Receita</Text></TouchableOpacity>
      </View>
      <Text style={styles.label}>Descrição</Text>
      <TextInput value={description} onChangeText={setDescription} placeholder="Ex.: Almoço na faculdade" style={styles.input} />
      <Text style={styles.label}>Valor (R$)</Text>
      <TextInput value={amount} onChangeText={setAmount} placeholder="Ex.: 25,50" keyboardType="decimal-pad" style={styles.input} />
      <Text style={styles.label}>Categoria</Text>
      <View style={styles.categories}>
        {categories.map(item => <TouchableOpacity key={item} onPress={() => setCategory(item)} style={[styles.category, category === item && styles.categorySelected]}><Text style={[styles.categoryText, category === item && styles.categoryTextSelected]}>{item}</Text></TouchableOpacity>)}
      </View>
      <PrimaryButton title="Salvar movimentação" onPress={handleSave} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.text, fontWeight: '700', marginBottom: 8, marginTop: 15 },
  row: { flexDirection: 'row', gap: 10 },
  typeButton: { flex: 1, borderWidth: 1, borderColor: colors.border, padding: 13, borderRadius: 12, alignItems: 'center', backgroundColor: '#FFFFFF' },
  selectedExpense: { backgroundColor: colors.softRed, borderColor: colors.expense },
  selectedIncome: { backgroundColor: colors.softGreen, borderColor: colors.income },
  typeText: { color: colors.muted, fontWeight: '700' },
  selectedText: { color: colors.text },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, color: colors.text },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  category: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: 9, paddingHorizontal: 12, backgroundColor: '#FFFFFF' },
  categorySelected: { backgroundColor: colors.softBlue, borderColor: colors.primary },
  categoryText: { color: colors.muted, fontSize: 12 },
  categoryTextSelected: { color: colors.primary, fontWeight: '700' }
});
