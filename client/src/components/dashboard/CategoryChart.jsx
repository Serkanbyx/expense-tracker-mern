import { useEffect, useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTransactions } from '../../context/TransactionContext';
import formatCurrency from '../../utils/formatCurrency';

const SKELETON_PULSE = 'animate-pulse rounded bg-gray-200';

const CATEGORY_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#3b82f6', '#84cc16',
  '#e11d48', '#06b6d4', '#a855f7', '#eab308', '#22d3ee',
];

const TAB_OPTIONS = [
  { key: 'expense', label: 'Expense' },
  { key: 'income', label: 'Income' },
];

const ChartSkeleton = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className={`${SKELETON_PULSE} mb-6 h-5 w-56`} />
    <div className="flex items-center justify-center">
      <div className={`${SKELETON_PULSE} h-64 w-64 rounded-full`} />
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const { name, value, percent } = payload[0].payload;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-1 text-sm font-semibold text-gray-700">{name}</p>
      <p className="text-sm text-gray-600">{formatCurrency(value)}</p>
      <p className="text-xs text-gray-400">{(percent * 100).toFixed(1)}%</p>
    </div>
  );
};

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}) => {
  if (percent < 0.05) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#374151"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs"
    >
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
};

/**
 * Transforms raw category breakdown array into pie-chart-ready format.
 * Input:  [{ category: "Food", total: 500 }, ...]
 * Output: [{ name: "Food", value: 500, percent: 0.33 }, ...]
 */
const transformCategoryData = (rawData) => {
  if (!rawData?.length) return [];

  const grandTotal = rawData.reduce((sum, item) => sum + item.total, 0);

  if (grandTotal === 0) return [];

  return rawData.map((item) => ({
    name: item.category,
    value: item.total,
    percent: item.total / grandTotal,
  }));
};

const CategoryChart = () => {
  const { categoryData, isLoading, fetchCategoryBreakdown } = useTransactions();
  const [activeTab, setActiveTab] = useState('expense');

  useEffect(() => {
    fetchCategoryBreakdown({ type: activeTab });
  }, [activeTab, fetchCategoryBreakdown]);

  const chartData = useMemo(
    () => transformCategoryData(categoryData),
    [categoryData],
  );

  if (isLoading) return <ChartSkeleton />;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Category Breakdown
        </h3>

        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          {TAB_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-72 items-center justify-center">
          <p className="text-sm text-gray-400">
            No {activeTab} data available
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={55}
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
              stroke="#fff"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '13px', paddingTop: '16px' }}
              iconType="circle"
              formatter={(value) => (
                <span className="text-gray-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CategoryChart;
