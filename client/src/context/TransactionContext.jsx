import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import toast from 'react-hot-toast';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getMonthlyBreakdown,
  getCategoryBreakdown,
} from '../services/transactionService';

const TransactionContext = createContext(null);

const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  SET_SUMMARY: 'SET_SUMMARY',
  SET_MONTHLY_DATA: 'SET_MONTHLY_DATA',
  SET_CATEGORY_DATA: 'SET_CATEGORY_DATA',
  SET_FILTERS: 'SET_FILTERS',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
};

const initialFilters = {
  month: '',
  category: '',
  type: '',
};

const initialState = {
  transactions: [],
  summary: null,
  monthlyData: [],
  categoryData: [],
  isLoading: false,
  filters: initialFilters,
};

const transactionReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ACTION_TYPES.SET_TRANSACTIONS:
      return { ...state, transactions: action.payload, isLoading: false };

    case ACTION_TYPES.SET_SUMMARY:
      return { ...state, summary: action.payload };

    case ACTION_TYPES.SET_MONTHLY_DATA:
      return { ...state, monthlyData: action.payload };

    case ACTION_TYPES.SET_CATEGORY_DATA:
      return { ...state, categoryData: action.payload };

    case ACTION_TYPES.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case ACTION_TYPES.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };

    case ACTION_TYPES.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t._id === action.payload._id ? action.payload : t,
        ),
      };

    case ACTION_TYPES.DELETE_TRANSACTION:
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

const TransactionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  const fetchTransactions = useCallback(async (filters = {}) => {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });

    try {
      const data = await getTransactions(filters);
      dispatch({ type: ACTION_TYPES.SET_TRANSACTIONS, payload: data.transactions });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch transactions');
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
    }
  }, []);

  const fetchSummary = useCallback(async (filters = {}) => {
    try {
      const data = await getSummary(filters);
      dispatch({ type: ACTION_TYPES.SET_SUMMARY, payload: data });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch summary');
    }
  }, []);

  const fetchMonthlyBreakdown = useCallback(async (filters = {}) => {
    try {
      const data = await getMonthlyBreakdown(filters);
      dispatch({ type: ACTION_TYPES.SET_MONTHLY_DATA, payload: data.breakdown });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch monthly data');
    }
  }, []);

  const fetchCategoryBreakdown = useCallback(async (filters = {}) => {
    try {
      const data = await getCategoryBreakdown(filters);
      dispatch({ type: ACTION_TYPES.SET_CATEGORY_DATA, payload: data.breakdown });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch category data');
    }
  }, []);

  const addTransaction = useCallback(async (transactionData) => {
    try {
      const data = await createTransaction(transactionData);
      dispatch({ type: ACTION_TYPES.ADD_TRANSACTION, payload: data.transaction });
      toast.success('Transaction added successfully');
      return data.transaction;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add transaction');
      throw error;
    }
  }, []);

  const editTransaction = useCallback(async (id, transactionData) => {
    try {
      const data = await updateTransaction(id, transactionData);
      dispatch({ type: ACTION_TYPES.UPDATE_TRANSACTION, payload: data.transaction });
      toast.success('Transaction updated successfully');
      return data.transaction;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update transaction');
      throw error;
    }
  }, []);

  const removeTransaction = useCallback(async (id) => {
    try {
      await deleteTransaction(id);
      dispatch({ type: ACTION_TYPES.DELETE_TRANSACTION, payload: id });
      toast.success('Transaction deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete transaction');
      throw error;
    }
  }, []);

  const setFilters = useCallback((newFilters) => {
    dispatch({ type: ACTION_TYPES.SET_FILTERS, payload: newFilters });
  }, []);

  /* Re-fetch transactions and summary when filters change */
  useEffect(() => {
    fetchTransactions(state.filters);
    fetchSummary(state.filters);
  }, [state.filters, fetchTransactions, fetchSummary]);

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
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

const useTransactions = () => {
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error(
      'useTransactions must be used within a TransactionProvider',
    );
  }

  return context;
};

export { TransactionContext, TransactionProvider, useTransactions };
