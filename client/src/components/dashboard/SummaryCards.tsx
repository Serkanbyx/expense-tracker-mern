import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { useTransactions } from '../../context/TransactionContext';
import formatCurrency from '../../utils/formatCurrency';
import { SummaryCardSkeleton } from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import ErrorMessage from '../ui/ErrorMessage';
import type { HeroIcon } from '@/types';

interface CardConfig {
  key: string;
  label: string;
  icon: HeroIcon;
  iconBg: string;
  iconColor: string;
  amountColor: string | null;
}

const CARD_CONFIG: CardConfig[] = [
  {
    key: 'totalIncome',
    label: 'Total Income',
    icon: ArrowTrendingUpIcon,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    amountColor: 'text-emerald-600',
  },
  {
    key: 'totalExpense',
    label: 'Total Expense',
    icon: ArrowTrendingDownIcon,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    amountColor: 'text-red-600',
  },
  {
    key: 'netBalance',
    label: 'Net Balance',
    icon: WalletIcon,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    amountColor: null,
  },
];

const SKELETON_COUNT = 3;

const SummaryCards = () => {
  const { summary, isLoading, error, fetchSummary } = useTransactions();

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <SummaryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error && !summary) {
    return (
      <ErrorMessage
        message="Failed to load summary data."
        onRetry={() => fetchSummary()}
      />
    );
  }

  if (
    !summary.totalIncome &&
    !summary.totalExpense &&
    !summary.netBalance
  ) {
    return (
      <EmptyState
        icon={WalletIcon}
        title="No financial data yet"
        description="Add your first transaction to see your income, expenses, and balance."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
      {CARD_CONFIG.map(
        ({ key, label, icon: Icon, iconBg, iconColor, amountColor }) => {
          const value = (summary as unknown as Record<string, number>)[key] ?? 0;
          const resolvedAmountColor =
            amountColor ?? (value >= 0 ? 'text-emerald-600' : 'text-red-600');

          return (
            <div
              key={key}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  {label}
                </span>
              </div>

              <p className={`mt-4 text-2xl font-bold ${resolvedAmountColor}`}>
                {formatCurrency(value)}
              </p>
            </div>
          );
        },
      )}
    </div>
  );
};

export default SummaryCards;
