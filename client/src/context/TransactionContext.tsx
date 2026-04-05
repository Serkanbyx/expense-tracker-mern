import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';
import type {
  Transaction,
  TransactionInput,
  TransactionFilters,
  TransactionState,
  TransactionContextValue,
  Pagination,
  SummaryResponse,
  MonthlyBreakdownItem,
  CategoryBreakdownItem,
} from '@/types';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getMonthlyBreakdown,
  getCategoryBreakdown,
} from '../services/transactionService';
import { extractErrorMessage } from '../utils/validation';

const TransactionContext = createContext<TransactionContextValue | null>(null);

type TransactionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRANSACTIONS'; payload: { transactions: Transaction[]; pagination: Pagination } }
  | { type: 'SET_SUMMARY'; payload: SummaryResponse }
  | { type: 'SET_MONTHLY_DATA'; payload: MonthlyBreakdownItem[] }
  | { type: 'SET_CATEGORY_DATA'; payload: CategoryBreakdownItem[] }
  | { type: 'SET_FILTERS'; payload: Partial<TransactionFilters> }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string };

const ITEMS_PER_PAGE = 10;

const initialFilters: TransactionFilters = {
  month: '',
  category: '',
  type: '',
  page: 1,
  limit: ITEMS_PER_PAGE,
};

const initialState: TransactionState = {
  transactions: [],
  pagination: null,
  summary: null,
  monthlyData: [],
  categoryData: [],
  isLoading: false,
  error: null,
  filters: initialFilters,
};

const transactionReducer = (state: TransactionState, action: TransactionAction): TransactionState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload.transactions,
        pagination: action.payload.pagination,
        isLoading: false,
      };

    case 'SET_SUMMARY':
      return { ...state, summary: action.payload };

    case 'SET_MONTHLY_DATA':
      return { ...state, monthlyData: action.payload };

    case 'SET_CATEGORY_DATA':
      return { ...state, categoryData: action.payload };

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };

    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t._id === action.payload._id ? action.payload : t,
        ),
      };

    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(
          (t) => t._id !== action.payload,
        ),
      };

    default:
      return state;
  }
};

const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);
  const [dataVersion, setDataVersion] = useState(0);

  const invalidateData = useCallback(() => setDataVersion((v) => v + 1), []);

  const fetchTransactions = useCallback(async (filters: TransactionFilters = {}): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const data = await getTransactions(filters);
      dispatch({
        type: 'SET_TRANSACTIONS',
        payload: { transactions: data.transactions, pagination: data.pagination },
      });
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to fetch transactions');
      toast.error(message);
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, []);

  const fetchSummary = useCallback(async (filters: TransactionFilters = {}): Promise<void> => {
    try {
      const data = await getSummary(filters);
      dispatch({ type: 'SET_SUMMARY', payload: data });
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to fetch summary');
      toast.error(message);
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, []);

  const fetchMonthlyBreakdown = useCallback(async (filters: TransactionFilters = {}): Promise<void> => {
    try {
      const data = await getMonthlyBreakdown(filters);
      dispatch({ type: 'SET_MONTHLY_DATA', payload: data.breakdown });
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to fetch monthly data');
      toast.error(message);
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, []);

  const fetchCategoryBreakdown = useCallback(async (filters: TransactionFilters = {}): Promise<void> => {
    try {
      const data = await getCategoryBreakdown(filters);
      dispatch({ type: 'SET_CATEGORY_DATA', payload: data.breakdown });
    } catch (error) {
      const message = extractErrorMessage(error, 'Failed to fetch category data');
      toast.error(message);
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  }, []);

  const addTransaction = useCallback(async (transactionData: TransactionInput): Promise<Transaction> => {
    try {
      const data = await createTransaction(transactionData);
      dispatch({ type: 'ADD_TRANSACTION', payload: data.transaction });
      invalidateData();
      toast.success('Transaction added successfully');
      return data.transaction;
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to add transaction'));
      throw error;
    }
  }, [invalidateData]);

  const editTransaction = useCallback(async (id: string, transactionData: Partial<TransactionInput>): Promise<Transaction> => {
    try {
      const data = await updateTransaction(id, transactionData);
      dispatch({ type: 'UPDATE_TRANSACTION', payload: data.transaction });
      invalidateData();
      toast.success('Transaction updated successfully');
      return data.transaction;
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to update transaction'));
      throw error;
    }
  }, [invalidateData]);

  const removeTransaction = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteTransaction(id);
      dispatch({ type: 'DELETE_TRANSACTION', payload: id });
      invalidateData();
      toast.success('Transaction deleted successfully');
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Failed to delete transaction'));
      throw error;
    }
  }, [invalidateData]);

  const setFilters = useCallback((newFilters: Partial<TransactionFilters>): void => {
    dispatch({ type: 'SET_FILTERS', payload: { ...newFilters, page: 1 } });
  }, []);

  const setPage = useCallback((page: number): void => {
    dispatch({ type: 'SET_FILTERS', payload: { page } });
  }, []);

  useEffect(() => {
    fetchTransactions(state.filters);
  }, [state.filters, dataVersion, fetchTransactions]);

  /* Re-fetch summary when filters change OR after any CRUD operation */
  useEffect(() => {
    fetchSummary(state.filters);
  }, [state.filters, dataVersion, fetchSummary]);

  return (
    <TransactionContext.Provider
      value={{
        ...state,
        fetchTransactions,
        fetchSummary,
        fetchMonthlyBreakdown,
        fetchCategoryBreakdown,
        addTransaction,
        editTransaction,
        removeTransaction,
        setFilters,
        setPage,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

const useTransactions = (): TransactionContextValue => {
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error(
      'useTransactions must be used within a TransactionProvider',
    );
  }

  return context;
};

export { TransactionContext, TransactionProvider, useTransactions };
