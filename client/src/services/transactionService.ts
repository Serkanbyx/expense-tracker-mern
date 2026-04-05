import type {
  BreakdownResponse,
  CategoryBreakdownItem,
  MonthlyBreakdownItem,
  SummaryResponse,
  TransactionFilters,
  TransactionInput,
  TransactionListResponse,
  TransactionResponse,
} from '@/types';
import api from './api';

const TRANSACTIONS_URL = '/transactions';

/**
 * Strips undefined/null values so Axios won't send empty query params.
 */
const cleanParams = (params: TransactionFilters): Record<string, string | number> =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Record<string, string | number>;

export const getTransactions = async (
  filters: TransactionFilters = {},
): Promise<TransactionListResponse> => {
  const { data } = await api.get<TransactionListResponse>(TRANSACTIONS_URL, {
    params: cleanParams(filters),
  });
  return data;
};

export const createTransaction = async (
  transactionData: TransactionInput,
): Promise<TransactionResponse> => {
  const { data } = await api.post<TransactionResponse>(TRANSACTIONS_URL, transactionData);
  return data;
};

export const updateTransaction = async (
  id: string,
  transactionData: Partial<TransactionInput>,
): Promise<TransactionResponse> => {
  const { data } = await api.put<TransactionResponse>(
    `${TRANSACTIONS_URL}/${id}`,
    transactionData,
  );
  return data;
};

export const deleteTransaction = async (id: string): Promise<{ message: string }> => {
  const { data } = await api.delete<{ message: string }>(`${TRANSACTIONS_URL}/${id}`);
  return data;
};

export const getSummary = async (filters: TransactionFilters = {}): Promise<SummaryResponse> => {
  const { data } = await api.get<SummaryResponse>(`${TRANSACTIONS_URL}/summary`, {
    params: cleanParams(filters),
  });
  return data;
};

export const getMonthlyBreakdown = async (
  filters: TransactionFilters = {},
): Promise<BreakdownResponse<MonthlyBreakdownItem>> => {
  const { data } = await api.get<BreakdownResponse<MonthlyBreakdownItem>>(
    `${TRANSACTIONS_URL}/monthly`,
    {
      params: cleanParams(filters),
    },
  );
  return data;
};

export const getCategoryBreakdown = async (
  filters: TransactionFilters = {},
): Promise<BreakdownResponse<CategoryBreakdownItem>> => {
  const { data } = await api.get<BreakdownResponse<CategoryBreakdownItem>>(
    `${TRANSACTIONS_URL}/categories`,
    {
      params: cleanParams(filters),
    },
  );
  return data;
};
