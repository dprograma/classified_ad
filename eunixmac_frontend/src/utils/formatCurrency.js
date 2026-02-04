/**
 * Format a number as currency with Naira symbol and thousand separators
 * @param {number|string} amount - The amount to format
 * @param {boolean} includeSymbol - Whether to include the ₦ symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, includeSymbol = true) => {
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Check if valid number
  if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
    return includeSymbol ? '₦0' : '0';
  }

  // Format with commas using en-US locale (always uses commas)
  const formatted = numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return includeSymbol ? `₦${formatted}` : formatted;
};

/**
 * Format a number without currency symbol
 * @param {number|string} amount - The amount to format
 * @returns {string} Formatted number string with commas
 */
export const formatNumber = (amount) => {
  return formatCurrency(amount, false);
};
