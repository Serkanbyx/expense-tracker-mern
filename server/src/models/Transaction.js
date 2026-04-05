const mongoose = require('mongoose');

const TRANSACTION_TYPES = ['income', 'expense'];

const CATEGORIES = [
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

const INCOME_CATEGORIES = ['salary', 'other'];
const EXPENSE_CATEGORIES = [
  'food',
  'transport',
  'entertainment',
  'health',
  'education',
  'shopping',
  'bills',
  'other',
];

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: TRANSACTION_TYPES,
        message: '{VALUE} is not a valid transaction type',
      },
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be at least 0.01'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  { timestamps: true },
);

transactionSchema.index({ userId: 1, date: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

Transaction.TRANSACTION_TYPES = TRANSACTION_TYPES;
Transaction.CATEGORIES = CATEGORIES;
Transaction.INCOME_CATEGORIES = INCOME_CATEGORIES;
Transaction.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;

module.exports = Transaction;
