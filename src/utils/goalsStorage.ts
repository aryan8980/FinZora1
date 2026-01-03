import type { Goal } from './dummyData';

const STORAGE_KEY = 'finzora-goals';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const loadUserGoals = (): Goal[] => {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is Goal => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.target === 'number' &&
        typeof item.current === 'number' &&
        typeof item.deadline === 'string' &&
        typeof item.category === 'string'
      );
    });
  } catch {
    return [];
  }
};

export const saveUserGoals = (goals: Goal[]): void => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  } catch {
    // ignore storage errors
  }
};

export const appendUserGoal = (goal: Goal): void => {
  const existing = loadUserGoals();
  saveUserGoals([...existing, goal]);
};
