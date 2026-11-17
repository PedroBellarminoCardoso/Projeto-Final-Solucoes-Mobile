import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types/Transaction';
import { DEFAULT_CATEGORY_BUDGETS } from '../utils/categories';

const TRANSACTIONS_KEY = '@cade-meu-dinheiro/transactions';
const BUDGETS_KEY = '@cade-meu-dinheiro/budgets';
const MONTHLY_LIMIT_KEY = '@cade-meu-dinheiro/monthly-limit';

export async function loadTransactions(): Promise<Transaction[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue) as Transaction[];
    }
    return [];
  } catch (e) {
    console.log('Erro ao carregar transações:', e);
    return [];
  }
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  try {
    const jsonValue = JSON.stringify(transactions);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, jsonValue);
  } catch (e) {
    console.log('Erro ao salvar transações:', e);
  }
}

export async function loadCategoryBudgets(): Promise<Record<string, number>> {
  try {
    const jsonValue = await AsyncStorage.getItem(BUDGETS_KEY);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue) as Record<string, number>;
    }
    return DEFAULT_CATEGORY_BUDGETS;
  } catch (e) {
    console.log('Erro ao carregar limites:', e);
    return DEFAULT_CATEGORY_BUDGETS;
  }
}

export async function saveCategoryBudgets(budgets: Record<string, number>): Promise<void> {
  try {
    const jsonValue = JSON.stringify(budgets);
    await AsyncStorage.setItem(BUDGETS_KEY, jsonValue);
  } catch (e) {
    console.log('Erro ao salvar limites:', e);
  }
}

export async function loadMonthlyLimit(): Promise<number | null> {
  try {
    const value = await AsyncStorage.getItem(MONTHLY_LIMIT_KEY);
    if (value !== null) {
      const parsed = Number(value);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    }
    return null;
  } catch (e) {
    console.log('Erro ao carregar limite mensal:', e);
    return null;
  }
}

export async function saveMonthlyLimit(limit: number): Promise<void> {
  try {
    await AsyncStorage.setItem(MONTHLY_LIMIT_KEY, String(limit));
  } catch (e) {
    console.log('Erro ao salvar limite mensal:', e);
  }
}
