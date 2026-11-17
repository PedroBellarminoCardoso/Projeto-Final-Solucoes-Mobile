import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types/Transaction';

const TRANSACTIONS_KEY = '@cade-meu-dinheiro/transactions';

export async function loadTransactions(): Promise<Transaction[]> {
  const value = await AsyncStorage.getItem(TRANSACTIONS_KEY);
  return value ? JSON.parse(value) as Transaction[] : [];
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}
