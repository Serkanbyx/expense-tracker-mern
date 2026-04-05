import type { ComponentType, ReactNode } from 'react';

// ─── Icon ─────────────────────────────────────────────

export type HeroIcon = ComponentType<{ className?: string }>;

// ─── User & Auth ──────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ─── Transactions ─────────────────────────────────────

export type TransactionType = 'income' | 'expense';

export type Category =
  | 'food'
  | 'salary'
  | 'transport'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'shopping'
  | 'bills'
  | 'other';

export interface Transaction {
  _id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description?: string;
  date: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  date?: string;
}

// ─── Pagination ───────────────────────────────────────

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── API Responses ────────────────────────────────────

export interface TransactionListResponse {
  transactions: Transaction[];
  pagination: Pagination;
}

export interface TransactionResponse {
  transaction: Transaction;
}

export interface SummaryResponse {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

export interface BreakdownResponse<T> {
  breakdown: T[];
}

export interface MonthlyBreakdownItem {
  month: number;
  year: number;
  type: TransactionType;
  total: number;
}

export interface CategoryBreakdownItem {
  category: string;
  total: number;
}

// ─── Filters ──────────────────────────────────────────

export interface TransactionFilters {
  month?: string;
  category?: string;
  type?: string;
  page?: number;
  limit?: number;
}

// ─── Transaction State & Context ─────────────────────

export interface TransactionState {
  transactions: Transaction[];
  pagination: Pagination | null;
  summary: SummaryResponse | null;
  monthlyData: MonthlyBreakdownItem[];
  categoryData: CategoryBreakdownItem[];
  isLoading: boolean;
  error: string | null;
  filters: TransactionFilters;
}

export interface TransactionContextValue extends TransactionState {
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>;
  fetchSummary: (filters?: TransactionFilters) => Promise<void>;
  fetchMonthlyBreakdown: (filters?: TransactionFilters) => Promise<void>;
  fetchCategoryBreakdown: (filters?: TransactionFilters) => Promise<void>;
  addTransaction: (data: TransactionInput) => Promise<Transaction>;
  editTransaction: (id: string, data: Partial<TransactionInput>) => Promise<Transaction>;
  removeTransaction: (id: string) => Promise<void>;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  setPage: (page: number) => void;
}

// ─── Component Props ─────────────────────────────────

export interface ChildrenProps {
  children: ReactNode;
}
