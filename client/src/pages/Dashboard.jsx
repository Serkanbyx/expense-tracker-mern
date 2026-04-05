import { useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';
import SummaryCards from '../components/dashboard/SummaryCards';
import MonthlyChart from '../components/dashboard/MonthlyChart';
import CategoryChart from '../components/dashboard/CategoryChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';

const Dashboard = () => {
  const { fetchMonthlyBreakdown, fetchCategoryBreakdown } = useTransactions();

  useEffect(() => {
    fetchMonthlyBreakdown();
    fetchCategoryBreakdown();
  }, [fetchMonthlyBreakdown, fetchCategoryBreakdown]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Dashboard</h1>

      <SummaryCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlyChart />
        <CategoryChart />
      </div>

      <RecentTransactions />
    </div>
  );
};

export default Dashboard;
