import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useTransactions } from '../../context/TransactionContext';
import formatCurrency from '../../utils/formatCurrency';

const SKELETON_PULSE = 'animate-pulse rounded bg-gray-200';

const RECENT_COUNT = 5;

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

const getCategoryStyle = (category) =>
  CATEGORY_STYLES[category] ?? CATEGORY_STYLES.other;

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

const SkeletonRow = () => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      <div className={`${SKELETON_PULSE} h-4 w-20`} />
      <div className={`${SKELETON_PULSE} h-5 w-16`} />
      <div className={`${SKELETON_PULSE} h-4 w-32`} />
    </div>
    <div className={`${SKELETON_PULSE} h-5 w-20`} />
  </div>
);

const RecentTransactions = () => {
  const { transactions, isLoading } = useTransactions();

  const recentTransactions = transactions.slice(0, RECENT_COUNT);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className={`${SKELETON_PULSE} mb-4 h-6 w-48`} />
        <div className="divide-y divide-gray-100">
          {Array.from({ length: RECENT_COUNT }, (_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Recent Transactions
        </h3>

        <Link
          to="/transactions"
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800"
        >
          View All
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {recentTransactions.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <p className="text-sm text-gray-400">No transactions yet</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {recentTransactions.map((transaction) => {
            const isIncome = transaction.type === 'income';

            return (
              <div
                key={transaction._id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <time className="shrink-0 text-sm text-gray-400">
                    {format(new Date(transaction.date), 'dd MMM yyyy')}
                  </time>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryStyle(transaction.category)}`}
                  >
                    {capitalize(transaction.category)}
                  </span>

                  <span className="truncate text-sm text-gray-600">
                    {transaction.description || '—'}
                  </span>
                </div>

                <span
                  className={`shrink-0 pl-4 text-sm font-semibold ${
                    isIncome ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {isIncome ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
