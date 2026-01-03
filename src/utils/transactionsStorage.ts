import type { Transaction } from './dummyData';

const STORAGE_KEY = 'finzora-transactions';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const loadUserTransactions = (): Transaction[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is Transaction => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.amount === 'number' &&
        typeof item.date === 'string' &&
        typeof item.category === 'string' &&
        typeof item.description === 'string' &&
        (item.type === 'income' || item.type === 'expense')
      );
    });
  } catch {
    return [];
  }
};

export const saveUserTransactions = (transactions: Transaction[]): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch {
    // ignore storage errors
  }
};

export const appendUserTransaction = (transaction: Transaction): void => {
  const existing = loadUserTransactions();
  saveUserTransactions([...existing, transaction]);
};
