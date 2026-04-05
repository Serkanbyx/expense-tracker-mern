import type { Category } from '@/types';

// ─── Category Arrays ─────────────────────────────────

export const CATEGORIES: Category[] = [
  'food',
  'salary',
  'transport',
  'entertainment',
  'health',
  'education',
  'shopping',
  'bills',
  'other',
];

export const INCOME_CATEGORIES: Category[] = ['salary', 'other'];

export const EXPENSE_CATEGORIES: Category[] = [
  'food',
  'transport',
  'entertainment',
  'health',
  'education',
  'shopping',
  'bills',
  'other',
];

// ─── Style Maps ──────────────────────────────────────

export const CATEGORY_STYLES: Record<string, string> = {
  food: 'bg-orange-100 text-orange-700',
  salary: 'bg-emerald-100 text-emerald-700',
  transport: 'bg-blue-100 text-blue-700',
  entertainment: 'bg-purple-100 text-purple-700',
  health: 'bg-rose-100 text-rose-700',
  education: 'bg-cyan-100 text-cyan-700',
  shopping: 'bg-pink-100 text-pink-700',
  bills: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700',
};

export const TYPE_STYLES: Record<string, string> = {
  income: 'bg-emerald-100 text-emerald-700',
  expense: 'bg-red-100 text-red-700',
};

export const getCategoryStyle = (category: string): string =>
  CATEGORY_STYLES[category] ?? CATEGORY_STYLES.other;

export const getTypeStyle = (type: string): string =>
  TYPE_STYLES[type] ?? TYPE_STYLES.expense;
