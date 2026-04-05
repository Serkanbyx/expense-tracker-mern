import { useCallback } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useTransactions } from '../../context/TransactionContext';
import type { Category } from '@/types';

const CATEGORIES: Category[] = [
  'food',
  'salary',
  'transport',
  'entertainment',
  'health',
  'education',
  'shopping',
  'bills',
  'other',
];

const capitalize = (str: string): string =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const FilterBar = () => {
  const { filters, setFilters } = useTransactions();

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilters({ [key]: value });
    },
    [setFilters],
  );

  const hasActiveFilters = filters.month || filters.category || filters.type;

  const handleClearFilters = useCallback(() => {
    setFilters({ month: '', category: '', type: '' });
  }, [setFilters]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex items-center gap-2 text-gray-500">
          <FunnelIcon className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">Filters</span>
        </div>

        {/* Month Picker */}
        <input
          type="month"
          value={filters.month}
          max={getCurrentMonth()}
          onChange={(e) => handleFilterChange('month', e.target.value)}
          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-auto"
        />

        {/* Category Dropdown */}
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-auto"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {capitalize(cat)}
            </option>
          ))}
        </select>

        {/* Type Dropdown */}
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-auto"
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-red-600 sm:ml-auto sm:w-auto"
          >
            <XMarkIcon className="h-4 w-4" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
