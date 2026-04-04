import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { useTransactions } from '../../context/TransactionContext';
import formatCurrency from '../../utils/formatCurrency';

const SKELETON_PULSE = 'animate-pulse rounded bg-gray-200';

const SkeletonCard = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-3">
      <div className={`${SKELETON_PULSE} h-10 w-10`} />
      <div className={`${SKELETON_PULSE} h-4 w-24`} />
    </div>
    <div className={`${SKELETON_PULSE} mt-4 h-8 w-32`} />
  </div>
);

const CARD_CONFIG = [
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

const SummaryCards = () => {
  const { summary, isLoading } = useTransactions();

  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
      {CARD_CONFIG.map(
        ({ key, label, icon: Icon, iconBg, iconColor, amountColor }) => {
          const value = summary[key] ?? 0;
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
