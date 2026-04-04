import api from './api';

const TRANSACTIONS_URL = '/api/transactions';

/**
 * Strips undefined/null values so Axios won't send empty query params.
 */
const cleanParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  );

export const getTransactions = async (filters = {}) => {
  const { data } = await api.get(TRANSACTIONS_URL, {
    params: cleanParams(filters),
  });
  return data;
};

export const createTransaction = async (transactionData) => {
  const { data } = await api.post(TRANSACTIONS_URL, transactionData);
  return data;
};

export const updateTransaction = async (id, transactionData) => {
  const { data } = await api.put(`${TRANSACTIONS_URL}/${id}`, transactionData);
  return data;
};

export const deleteTransaction = async (id) => {
  const { data } = await api.delete(`${TRANSACTIONS_URL}/${id}`);
  return data;
};

export const getSummary = async (filters = {}) => {
  const { data } = await api.get(`${TRANSACTIONS_URL}/summary`, {
    params: cleanParams(filters),
  });
  return data;
};

export const getMonthlyBreakdown = async (filters = {}) => {
  const { data } = await api.get(`${TRANSACTIONS_URL}/monthly`, {
    params: cleanParams(filters),
  });
  return data;
};

export const getCategoryBreakdown = async (filters = {}) => {
  const { data } = await api.get(`${TRANSACTIONS_URL}/categories`, {
    params: cleanParams(filters),
  });
  return data;
};
