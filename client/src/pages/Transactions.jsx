import FilterBar from '../components/transactions/FilterBar';

const Transactions = () => {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>

      <FilterBar />
    </div>
  );
};

export default Transactions;
