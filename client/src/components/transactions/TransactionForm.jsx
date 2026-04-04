import { useState, useCallback, useEffect, useMemo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useTransactions } from '../../context/TransactionContext';
import {
  validateAmount,
  validateCategory,
  validateDate,
  sanitizeFormData,
  VALIDATION_LIMITS,
} from '../../utils/validation';

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

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

const getTodayString = () => new Date().toISOString().split('T')[0];

const getInitialFormState = (transaction) => {
  if (transaction) {
    return {
      type: transaction.type,
      category: transaction.category,
      amount: String(transaction.amount),
      date: new Date(transaction.date).toISOString().split('T')[0],
      description: transaction.description || '',
    };
  }

  return {
    type: 'expense',
    category: '',
    amount: '',
    date: getTodayString(),
    description: '',
  };
};

const inputBaseClass =
  'w-full rounded-lg border bg-gray-50 px-3 py-2.5 text-sm text-gray-700 transition-colors focus:outline-none focus:ring-1 disabled:opacity-50';

const getInputClass = (hasError) =>
  hasError
    ? `${inputBaseClass} border-red-400 focus:border-red-500 focus:ring-red-500`
    : `${inputBaseClass} border-gray-300 focus:border-indigo-500 focus:ring-indigo-500`;

const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1 text-xs text-red-600" role="alert">
      {message}
    </p>
  ) : null;

/* ── Type Toggle ──────────────────────────────────────── */

const TypeToggle = ({ activeType, onChange, disabled }) => (
  <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
    {['income', 'expense'].map((type) => {
      const isActive = activeType === type;
      const activeStyle =
        type === 'income'
          ? 'bg-emerald-500 text-white shadow-sm'
          : 'bg-red-500 text-white shadow-sm';

      return (
        <button
          key={type}
          type="button"
          disabled={disabled}
          onClick={() => onChange(type)}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
            isActive ? activeStyle : 'text-gray-500 hover:text-gray-700'
          } disabled:opacity-50`}
        >
          {capitalize(type)}
        </button>
      );
    })}
  </div>
);

/* ── Main Component ───────────────────────────────────── */

const TransactionForm = ({ transaction = null, onClose }) => {
  const { addTransaction, editTransaction } = useTransactions();
  const isEditMode = Boolean(transaction);

  const [formData, setFormData] = useState(() =>
    getInitialFormState(transaction),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const categories = useMemo(
    () =>
      formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES,
    [formData.type],
  );

  useEffect(() => {
    if (!categories.includes(formData.category)) {
      setFormData((prev) => ({ ...prev, category: '' }));
    }
  }, [formData.type, categories, formData.category]);

  const validateField = useCallback(
    (field, value) => {
      switch (field) {
        case 'category':
          return validateCategory(value);
        case 'amount':
          return validateAmount(value);
        case 'date':
          return validateDate(value);
        default:
          return null;
      }
    },
    [],
  );

  const validateAllFields = useCallback(() => {
    const fieldErrors = {
      category: validateCategory(formData.category),
      amount: validateAmount(formData.amount),
      date: validateDate(formData.date),
    };

    const activeErrors = Object.fromEntries(
      Object.entries(fieldErrors).filter(([, msg]) => msg !== null),
    );

    setErrors(activeErrors);
    setTouched({ category: true, amount: true, date: true });

    return Object.keys(activeErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => {
          if (error) return { ...prev, [field]: error };
          const { [field]: _, ...rest } = prev;
          return rest;
        });
      }
    },
    [touched, validateField],
  );

  const handleBlur = useCallback(
    (field) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const error = validateField(field, formData[field]);
      setErrors((prev) => {
        if (error) return { ...prev, [field]: error };
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    },
    [formData, validateField],
  );

  const handleTypeChange = useCallback((type) => {
    setFormData((prev) => ({ ...prev, type }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateAllFields()) return;

      setIsSubmitting(true);

      const sanitized = sanitizeFormData(formData);

      const payload = {
        type: sanitized.type,
        category: sanitized.category,
        amount: parseFloat(sanitized.amount),
        date: sanitized.date,
        description: sanitized.description || undefined,
      };

      try {
        if (isEditMode) {
          await editTransaction(transaction._id, payload);
        } else {
          await addTransaction(payload);
        }
        onClose();
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateAllFields, isEditMode, transaction, addTransaction, editTransaction, onClose],
  );

  const isValid =
    formData.type &&
    formData.category &&
    parseFloat(formData.amount) >= 0.01 &&
    formData.date &&
    Object.keys(errors).length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditMode ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Type
            </label>
            <TypeToggle
              activeType={formData.type}
              onChange={handleTypeChange}
              disabled={isSubmitting}
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              onBlur={() => handleBlur('category')}
              disabled={isSubmitting}
              className={getInputClass(touched.category && errors.category)}
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {capitalize(cat)}
                </option>
              ))}
            </select>
            <FieldError message={touched.category && errors.category} />
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="amount"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Amount
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                $
              </span>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                onBlur={() => handleBlur('amount')}
                disabled={isSubmitting}
                className={`${getInputClass(touched.amount && errors.amount)} pl-7 pr-3`}
              />
            </div>
            <FieldError message={touched.amount && errors.amount} />
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              onBlur={() => handleBlur('date')}
              disabled={isSubmitting}
              className={getInputClass(touched.date && errors.date)}
            />
            <FieldError message={touched.date && errors.date} />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Description{' '}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <input
              id="description"
              type="text"
              maxLength={VALIDATION_LIMITS.DESCRIPTION_MAX}
              placeholder="e.g. Monthly groceries"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              disabled={isSubmitting}
              className={getInputClass(false)}
            />
            <p className="mt-1 text-xs text-gray-400">
              {formData.description.length}/{VALIDATION_LIMITS.DESCRIPTION_MAX}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving…'
                : isEditMode
                  ? 'Update Transaction'
                  : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
