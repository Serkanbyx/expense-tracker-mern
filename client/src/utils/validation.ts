const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALIDATION_LIMITS = {
  NAME_MAX: 50,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  DESCRIPTION_MAX: 200,
  AMOUNT_MAX: 1_000_000_000,
} as const;

interface ApiError {
  response?: {
    data?: {
      message?: string;
      errors?: Array<{ message?: string; msg?: string }>;
      stack?: string;
    };
  };
  code?: string;
  message?: string;
}

/**
 * Validates email format.
 * @returns error message or null if valid
 */
const validateEmail = (email: string): string | null => {
  if (!email.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address';
  return null;
};

/**
 * Validates password with min/max length.
 * @param isLogin — skip min length for login
 */
const validatePassword = (password: string, isLogin = false): string | null => {
  if (!password) return 'Password is required';
  if (!isLogin && password.length < VALIDATION_LIMITS.PASSWORD_MIN) {
    return `Password must be at least ${VALIDATION_LIMITS.PASSWORD_MIN} characters`;
  }
  if (password.length > VALIDATION_LIMITS.PASSWORD_MAX) {
    return `Password must be at most ${VALIDATION_LIMITS.PASSWORD_MAX} characters`;
  }
  return null;
};

const validateName = (name: string): string | null => {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length > VALIDATION_LIMITS.NAME_MAX) {
    return `Name must be at most ${VALIDATION_LIMITS.NAME_MAX} characters`;
  }
  return null;
};

const validateAmount = (amount: string | number): string | null => {
  if (!amount && amount !== 0) return 'Amount is required';
  const num = parseFloat(String(amount));
  if (Number.isNaN(num) || num < 0.01) return 'Amount must be at least 0.01';
  if (num > VALIDATION_LIMITS.AMOUNT_MAX) return 'Amount is too large';
  return null;
};

const validateCategory = (category: string): string | null => {
  if (!category) return 'Please select a category';
  return null;
};

const validateDate = (date: string): string | null => {
  if (!date) return 'Date is required';

  const selected = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (selected > today) return 'Date cannot be in the future';
  return null;
};

/**
 * Strips leading/trailing whitespace from all string fields in an object.
 */
function sanitizeFormData<T extends Record<string, unknown>>(data: T): T;
function sanitizeFormData<T extends object>(data: T): T;
function sanitizeFormData<T extends object>(data: T): T {
  return Object.fromEntries(
    Object.entries(data as Record<string, unknown>).map(([key, value]) => [
      key,
      typeof value === 'string' ? value.trim() : value,
    ]),
  ) as T;
}

/**
 * Extracts a user-friendly error message from an API error response.
 * Handles both `{ message }` and `{ errors: [{ field, message }] }` shapes.
 * Never exposes raw objects, stack traces, or sensitive data.
 */
const extractErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string => {
  const err = error as ApiError;
  if (!err.response) {
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      return 'Network error. Please check your connection and try again.';
    }
    if (err.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    return fallback;
  }

  const { data } = err.response;

  if (data?.message && typeof data.message === 'string') {
    return data.message;
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.map((e) => e.message || e.msg).join('. ');
  }

  return fallback;
};

export {
  EMAIL_REGEX,
  VALIDATION_LIMITS,
  validateEmail,
  validatePassword,
  validateName,
  validateAmount,
  validateCategory,
  validateDate,
  sanitizeFormData,
  extractErrorMessage,
};
