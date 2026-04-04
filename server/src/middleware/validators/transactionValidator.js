const { body } = require('express-validator');
const Transaction = require('../../models/Transaction');

const { TRANSACTION_TYPES, CATEGORIES } = Transaction;

const createTransactionRules = [
  body('type')
    .notEmpty()
    .withMessage('Transaction type is required')
    .isIn(TRANSACTION_TYPES)
    .withMessage(`Type must be one of: ${TRANSACTION_TYPES.join(', ')}`),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ gt: 0, max: 999999999.99 })
    .withMessage('Amount must be a positive number (max 999,999,999.99)'),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .escape()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),

  body('description')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 format')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Date cannot be in the future');
      }
      return true;
    }),
];

const updateTransactionRules = [
  body('type')
    .optional()
    .isIn(TRANSACTION_TYPES)
    .withMessage(`Type must be one of: ${TRANSACTION_TYPES.join(', ')}`),

  body('amount')
    .optional()
    .isFloat({ gt: 0, max: 999999999.99 })
    .withMessage('Amount must be a positive number (max 999,999,999.99)'),

  body('category')
    .optional()
    .trim()
    .escape()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),

  body('description')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),

  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 format')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Date cannot be in the future');
      }
      return true;
    }),
];

module.exports = { createTransactionRules, updateTransactionRules };
