import FilterBar from '../components/transactions/FilterBar';
import TransactionList from '../components/transactions/TransactionList';

const Transactions = () => {
  const handleEdit = (transaction) => {
    // TODO: will be implemented with TransactionForm modal in next step
    console.log('Edit transaction:', transaction._id);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>

      <FilterBar />
      <TransactionList onEdit={handleEdit} />
    </div>
  );
};

export default Transactions;
