const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALIDATION_LIMITS = {
  NAME_MAX: 50,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  DESCRIPTION_MAX: 200,
  AMOUNT_MAX: 1_000_000_000,
};

/**
 * Validates email format.
 * @returns {string | null} error message or null if valid
 */
const validateEmail = (email) => {
  if (!email.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address';
  return null;
};

/**
 * Validates password with min/max length.
 * @param {boolean} isLogin — skip min length for login
 */
const validatePassword = (password, isLogin = false) => {
  if (!password) return 'Password is required';
  if (!isLogin && password.length < VALIDATION_LIMITS.PASSWORD_MIN) {
    return `Password must be at least ${VALIDATION_LIMITS.PASSWORD_MIN} characters`;
  }
  if (password.length > VALIDATION_LIMITS.PASSWORD_MAX) {
    return `Password must be at most ${VALIDATION_LIMITS.PASSWORD_MAX} characters`;
  }
  return null;
};

const validateName = (name) => {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length > VALIDATION_LIMITS.NAME_MAX) {
    return `Name must be at most ${VALIDATION_LIMITS.NAME_MAX} characters`;
  }
  return null;
};

const validateAmount = (amount) => {
  if (!amount && amount !== 0) return 'Amount is required';
  const num = parseFloat(amount);
  if (Number.isNaN(num) || num < 0.01) return 'Amount must be at least 0.01';
  if (num > VALIDATION_LIMITS.AMOUNT_MAX) return 'Amount is too large';
  return null;
};

const validateCategory = (category) => {
  if (!category) return 'Please select a category';
  return null;
};

const validateDate = (date) => {
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
const sanitizeFormData = (data) =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      typeof value === 'string' ? value.trim() : value,
    ]),
  );

/**
 * Extracts a user-friendly error message from an API error response.
 * Handles both `{ message }` and `{ errors: [{ field, message }] }` shapes.
 * Never exposes raw objects, stack traces, or sensitive data.
 */
const extractErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error.response) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    return fallback;
  }

  const { data } = error.response;

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
