import { Transaction } from '../types/Transaction';

export function getTotals(transactions: Transaction[]) {
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  return { income, expenses, balance: income - expenses };
}
