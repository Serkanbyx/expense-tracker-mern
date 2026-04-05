const Transaction = require('../models/Transaction');

const { TRANSACTION_TYPES, CATEGORIES, INCOME_CATEGORIES, EXPENSE_CATEGORIES } = Transaction;

const getConfig = (_req, res) => {
  res.status(200).json({
    transactionTypes: TRANSACTION_TYPES,
    categories: CATEGORIES,
    incomeCategories: INCOME_CATEGORIES,
    expenseCategories: EXPENSE_CATEGORIES,
  });
};

module.exports = { getConfig };
