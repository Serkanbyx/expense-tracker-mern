import SummaryCards from '../components/dashboard/SummaryCards';

const Dashboard = () => {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <SummaryCards />
    </div>
  );
};

export default Dashboard;
