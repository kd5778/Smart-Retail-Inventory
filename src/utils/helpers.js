// ID generators and formatting utils

/**
 * Generate a Purchase Order number.
 * Format: PO-YYYYMMDD-XXXX (4 random digits)
 * @returns {string}
 */
const generatePONumber = () => {
  const date = new Date();
  const dateStr =
    date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(1000 + Math.random() * 9000));
  return `PO-${dateStr}-${random}`;
};

/**
 * Generate a Sales Order number.
 * Format: SO-YYYYMMDD-XXXX (4 random digits)
 * @returns {string}
 */
const generateSONumber = () => {
  const date = new Date();
  const dateStr =
    date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(1000 + Math.random() * 9000));
  return `SO-${dateStr}-${random}`;
};

/**
 * Generate a Payment reference number.
 * Format: PAY-YYYYMMDD-XXXX (4 random digits)
 * @returns {string}
 */
const generatePaymentNumber = () => {
  const date = new Date();
  const dateStr =
    date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(1000 + Math.random() * 9000));
  return `PAY-${dateStr}-${random}`;
};

/**
 * Generate a SKU code with a given prefix.
 * Format: PREFIX-XXXXX (5 random alphanumeric characters)
 * @param {string} prefix - SKU prefix (e.g., 'ELEC', 'FOOD')
 * @returns {string}
 */
const generateSKU = (prefix = 'SKU') => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 5; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix.toUpperCase()}-${suffix}`;
};

/**
 * Format a date to YYYY-MM-DD string.
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculate pagination offset and limit.
 * @param {number|string} page - Current page number (1-based)
 * @param {number|string} limit - Items per page
 * @returns {{ offset: number, limit: number }}
 */
const paginate = (page = 1, limit = 20) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (parsedPage - 1) * parsedLimit;
  return { offset, limit: parsedLimit };
};

module.exports = {
  generatePONumber,
  generateSONumber,
  generatePaymentNumber,
  generateSKU,
  formatDate,
  paginate
};
