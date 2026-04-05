import { useState, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useTransactions } from '../context/TransactionContext';
import FilterBar from '../components/transactions/FilterBar';
import TransactionList from '../components/transactions/TransactionList';
import TransactionForm from '../components/transactions/TransactionForm';
import Pagination from '../components/ui/Pagination';
import type { Transaction } from '@/types';

const Transactions = () => {
  const { pagination, setPage } = useTransactions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleAdd = useCallback(() => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Transactions
        </h1>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <FilterBar />
      <TransactionList onEdit={handleEdit} />

      {pagination && (
        <Pagination pagination={pagination} onPageChange={setPage} />
      )}

      {isFormOpen && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
};

export default Transactions;
