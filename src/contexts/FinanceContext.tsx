import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Transaction } from '../types/Transaction';
import { loadTransactions, saveTransactions } from '../services/storage';

interface FinanceContextValue {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions()
      .then(setTransactions)
      .catch(error => console.warn('Não foi possível carregar os dados:', error))
      .finally(() => setLoading(false));
  }, []);

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

  const value = useMemo(() => ({ transactions, loading, addTransaction, removeTransaction }), [transactions, loading]);
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance deve ser usado dentro de FinanceProvider');
  return context;
}
