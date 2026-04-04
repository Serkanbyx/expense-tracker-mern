/**
 * Formats a number as USD currency string.
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., "$12,500.00")
 */
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);

export default formatCurrency;
