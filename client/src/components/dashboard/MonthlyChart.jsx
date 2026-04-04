import { useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { useTransactions } from '../../context/TransactionContext';
import formatCurrency from '../../utils/formatCurrency';

const SKELETON_PULSE = 'animate-pulse rounded bg-gray-200';

const ChartSkeleton = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div className={`${SKELETON_PULSE} mb-6 h-5 w-48`} />
    <div className={`${SKELETON_PULSE} h-72 w-full`} />
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-1 text-sm font-semibold text-gray-700">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
};

/**
 * Transforms raw monthly breakdown array into chart-ready format.
 * Input:  [{ month: 1, year: 2024, type: "income", total: 5000 }, ...]
 * Output: [{ month: "Jan 2024", income: 5000, expense: 3000 }, ...]
 */
const transformMonthlyData = (rawData) => {
  if (!rawData?.length) return [];

  const grouped = {};

  rawData.forEach(({ month, year, type, total }) => {
    const key = `${year}-${month}`;

    if (!grouped[key]) {
      const label = format(new Date(year, month - 1), 'MMM yyyy');
      grouped[key] = { month: label, income: 0, expense: 0, sortKey: key };
    }

    grouped[key][type] = total;
  });

  return Object.values(grouped).sort((a, b) =>
    a.sortKey.localeCompare(b.sortKey),
  );
};

const MonthlyChart = () => {
  const { monthlyData, isLoading, fetchMonthlyBreakdown } = useTransactions();

  useEffect(() => {
    fetchMonthlyBreakdown();
  }, [fetchMonthlyBreakdown]);

  const chartData = useMemo(
    () => transformMonthlyData(monthlyData),
    [monthlyData],
  );

  if (isLoading) return <ChartSkeleton />;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">
        Monthly Income vs Expense
      </h3>

      {chartData.length === 0 ? (
        <div className="flex h-72 items-center justify-center">
          <p className="text-sm text-gray-400">No data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '13px', paddingTop: '8px' }}
              iconType="circle"
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="expense"
              name="Expense"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MonthlyChart;
