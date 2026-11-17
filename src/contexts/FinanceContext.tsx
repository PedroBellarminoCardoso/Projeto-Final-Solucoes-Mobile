import React, { createContext, useContext, useEffect, useState } from 'react';
import { Transaction } from '../types/Transaction';
import {
  loadCategoryBudgets,
  loadMonthlyLimit,
  loadTransactions,
  saveCategoryBudgets,
  saveMonthlyLimit,
  saveTransactions
} from '../services/storage';
import { DEFAULT_CATEGORY_BUDGETS } from '../utils/categories';
import { shiftMonth } from '../utils/date';

interface FinanceContextValue {
  transactions: Transaction[];
  loading: boolean;
  selectedMonth: Date;
  changeMonth: (delta: number) => void;
  categoryBudgets: Record<string, number>;
  monthlyLimit: number;
  updateCategoryBudget: (category: string, limit: number) => Promise<void>;
  updateMonthlyLimit: (limit: number) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  readNotifications: string[];
  markAllNotificationsRead: (ids: string[]) => void;
  hideValues: boolean;
  toggleHideValues: () => void;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>(DEFAULT_CATEGORY_BUDGETS);
  const [customMonthlyLimit, setCustomMonthlyLimit] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [loading, setLoading] = useState(true);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  const [hideValues, setHideValues] = useState(false);

  const carregarDados = async () => {
    try {
      const [loadedTx, loadedBudgets, loadedLimit] = await Promise.all([
        loadTransactions(),
        loadCategoryBudgets(),
        loadMonthlyLimit()
      ]);
      setTransactions(loadedTx);
      setCategoryBudgets(loadedBudgets);
      setCustomMonthlyLimit(loadedLimit);
    } catch (error) {
      console.log('Não foi possível carregar os dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const monthlyLimit =
    customMonthlyLimit !== null
      ? customMonthlyLimit
      : Object.values(categoryBudgets).reduce((sum, v) => sum + v, 0);

  const addTransaction = async (data: Omit<Transaction, 'id'>) => {
    const next = [{ ...data, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }, ...transactions];
    setTransactions(next);
    await saveTransactions(next);
  };

  const removeTransaction = async (id: string) => {
    const next = transactions.filter(item => item.id !== id);
    setTransactions(next);
    await saveTransactions(next);
  };

  const updateCategoryBudget = async (category: string, limit: number) => {
    const next = { ...categoryBudgets, [category]: limit };
    setCategoryBudgets(next);
    await saveCategoryBudgets(next);
  };

  const updateMonthlyLimit = async (limit: number) => {
    setCustomMonthlyLimit(limit);
    await saveMonthlyLimit(limit);
  };

  const changeMonth = (delta: number) => {
    setSelectedMonth(prev => shiftMonth(prev, delta));
  };

  const markAllNotificationsRead = (ids: string[]) => {
    setReadNotifications(prev => Array.from(new Set([...prev, ...ids])));
  };

  const toggleHideValues = () => {
    setHideValues(!hideValues);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        loading,
        selectedMonth,
        changeMonth,
        categoryBudgets,
        monthlyLimit,
        updateCategoryBudget,
        updateMonthlyLimit,
        addTransaction,
        removeTransaction,
        readNotifications,
        markAllNotificationsRead,
        hideValues,
        toggleHideValues
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de FinanceProvider');
  }
  return context;
}
