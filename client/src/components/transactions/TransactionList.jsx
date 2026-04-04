import { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import {
  PencilSquareIcon,
  TrashIcon,
  InboxIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useTransactions } from '../../context/TransactionContext';
import formatCurrency from '../../utils/formatCurrency';

const SKELETON_PULSE = 'animate-pulse rounded bg-gray-200';

const CATEGORY_STYLES = {
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

const TYPE_STYLES = {
  income: 'bg-emerald-100 text-emerald-700',
  expense: 'bg-red-100 text-red-700',
};

const getCategoryStyle = (category) =>
  CATEGORY_STYLES[category] ?? CATEGORY_STYLES.other;

const getTypeStyle = (type) => TYPE_STYLES[type] ?? TYPE_STYLES.expense;

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

/* ── Skeleton Components ─────────────────────────────── */

const SkeletonTableRow = () => (
  <tr>
    <td className="px-4 py-3">
      <div className={`${SKELETON_PULSE} h-4 w-24`} />
    </td>
    <td className="px-4 py-3">
      <div className={`${SKELETON_PULSE} h-5 w-16 rounded-full`} />
    </td>
    <td className="px-4 py-3">
      <div className={`${SKELETON_PULSE} h-5 w-20 rounded-full`} />
    </td>
    <td className="px-4 py-3">
      <div className={`${SKELETON_PULSE} h-4 w-36`} />
    </td>
    <td className="px-4 py-3 text-right">
      <div className={`${SKELETON_PULSE} ml-auto h-4 w-24`} />
    </td>
    <td className="px-4 py-3 text-right">
      <div className="flex justify-end gap-2">
        <div className={`${SKELETON_PULSE} h-8 w-8 rounded-lg`} />
        <div className={`${SKELETON_PULSE} h-8 w-8 rounded-lg`} />
      </div>
    </td>
  </tr>
);

const SkeletonCard = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div className={`${SKELETON_PULSE} h-4 w-24`} />
      <div className={`${SKELETON_PULSE} h-5 w-20`} />
    </div>
    <div className="mt-3 flex gap-2">
      <div className={`${SKELETON_PULSE} h-5 w-16 rounded-full`} />
      <div className={`${SKELETON_PULSE} h-5 w-20 rounded-full`} />
    </div>
    <div className={`${SKELETON_PULSE} mt-3 h-4 w-full`} />
    <div className="mt-3 flex justify-end gap-2">
      <div className={`${SKELETON_PULSE} h-8 w-8 rounded-lg`} />
      <div className={`${SKELETON_PULSE} h-8 w-8 rounded-lg`} />
    </div>
  </div>
);

const SKELETON_COUNT = 5;

/* ── Delete Confirmation Dialog ──────────────────────── */

const DeleteConfirmDialog = ({ transaction, onConfirm, onCancel, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="fixed inset-0 bg-black/50 transition-opacity"
      onClick={onCancel}
      aria-hidden="true"
    />

    <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Delete Transaction
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-700">
            {transaction.description || 'this transaction'}
          </span>
          ? This action cannot be undone.
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

/* ── Empty State ─────────────────────────────────────── */

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
      <InboxIcon className="h-8 w-8 text-gray-400" />
    </div>
    <h3 className="mt-4 text-base font-semibold text-gray-800">
      No transactions found
    </h3>
    <p className="mt-1 text-sm text-gray-400">
      Try adjusting your filters or add a new transaction.
    </p>
  </div>
);

/* ── Action Buttons ──────────────────────────────────── */

const ActionButtons = ({ onEdit, onDelete }) => (
  <div className="flex items-center justify-end gap-1.5">
    <button
      type="button"
      onClick={onEdit}
      aria-label="Edit transaction"
      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
    >
      <PencilSquareIcon className="h-5 w-5" />
    </button>
    <button
      type="button"
      onClick={onDelete}
      aria-label="Delete transaction"
      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
    >
      <TrashIcon className="h-5 w-5" />
    </button>
  </div>
);

/* ── Amount Cell ─────────────────────────────────────── */

const AmountDisplay = ({ type, amount }) => {
  const isIncome = type === 'income';

  return (
    <span
      className={`text-sm font-semibold ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}
    >
      {isIncome ? '+' : '-'}
      {formatCurrency(amount)}
    </span>
  );
};

/* ── Desktop Table ───────────────────────────────────── */

const TransactionTable = ({ transactions, onEdit, onDelete }) => (
  <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50">
          <th className="px-4 py-3 font-medium text-gray-500">Date</th>
          <th className="px-4 py-3 font-medium text-gray-500">Type</th>
          <th className="px-4 py-3 font-medium text-gray-500">Category</th>
          <th className="px-4 py-3 font-medium text-gray-500">Description</th>
          <th className="px-4 py-3 text-right font-medium text-gray-500">
            Amount
          </th>
          <th className="px-4 py-3 text-right font-medium text-gray-500">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {transactions.map((transaction) => (
          <tr
            key={transaction._id}
            className="transition-colors hover:bg-gray-50/50"
          >
            <td className="whitespace-nowrap px-4 py-3 text-gray-500">
              {format(new Date(transaction.date), 'dd MMM yyyy')}
            </td>
            <td className="px-4 py-3">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeStyle(transaction.type)}`}
              >
                {capitalize(transaction.type)}
              </span>
            </td>
            <td className="px-4 py-3">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryStyle(transaction.category)}`}
              >
                {capitalize(transaction.category)}
              </span>
            </td>
            <td className="max-w-xs truncate px-4 py-3 text-gray-700">
              {transaction.description || '—'}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right">
              <AmountDisplay
                type={transaction.type}
                amount={transaction.amount}
              />
            </td>
            <td className="px-4 py-3">
              <ActionButtons
                onEdit={() => onEdit(transaction)}
                onDelete={() => onDelete(transaction)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/* ── Mobile Card List ────────────────────────────────── */

const TransactionCardList = ({ transactions, onEdit, onDelete }) => (
  <div className="space-y-3 md:hidden">
    {transactions.map((transaction) => (
        <div
          key={transaction._id}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <time className="text-sm text-gray-400">
              {format(new Date(transaction.date), 'dd MMM yyyy')}
            </time>
            <AmountDisplay
              type={transaction.type}
              amount={transaction.amount}
            />
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeStyle(transaction.type)}`}
            >
              {capitalize(transaction.type)}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryStyle(transaction.category)}`}
            >
              {capitalize(transaction.category)}
            </span>
          </div>

          {transaction.description && (
            <p className="mt-2 truncate text-sm text-gray-600">
              {transaction.description}
            </p>
          )}

          <div className="mt-3 flex justify-end border-t border-gray-100 pt-3">
            <ActionButtons
              onEdit={() => onEdit(transaction)}
              onDelete={() => onDelete(transaction)}
            />
          </div>
        </div>
      ))}
  </div>
);

/* ── Main Component ──────────────────────────────────── */

const TransactionList = ({ onEdit }) => {
  const { transactions, isLoading, removeTransaction } = useTransactions();

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      ),
    [transactions],
  );

  const handleDeleteClick = useCallback((transaction) => {
    setDeleteTarget(transaction);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await removeTransaction(deleteTarget._id);
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, removeTransaction]);

  /* Loading Skeleton */
  if (isLoading) {
    return (
      <>
        {/* Desktop skeleton */}
        <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 font-medium text-gray-500">Category</th>
                <th className="px-4 py-3 font-medium text-gray-500">Description</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <SkeletonTableRow key={i} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile skeleton */}
        <div className="space-y-3 md:hidden">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </>
    );
  }

  /* Empty State */
  if (sortedTransactions.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <TransactionTable
        transactions={sortedTransactions}
        onEdit={onEdit}
        onDelete={handleDeleteClick}
      />

      <TransactionCardList
        transactions={sortedTransactions}
        onEdit={onEdit}
        onDelete={handleDeleteClick}
      />

      {deleteTarget && (
        <DeleteConfirmDialog
          transaction={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};

export default TransactionList;
