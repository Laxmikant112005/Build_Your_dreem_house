/**
 * Utils Index
 * 
 * This folder contains utility functions and helpers.
 * Utilities are pure functions that perform common tasks.
 * 
 * Utility Types:
 * - Formatters (date, currency, text)
 * - Validators (email, phone, regex)
 * - Helpers (deep clone, debounce, throttle)
 * - Constants (enums, config values)
 * 
 * Best Practices:
 * - Keep utilities pure (no side effects)
 * - Single responsibility
 * - Well-documented with JSDoc
 * - Thoroughly tested
 * 
 * Usage: Import utilities directly from their respective files
 * Example: import { formatDate, validateEmail } from './utils';
 */

// Export all utility functions
// Add new utility exports here as needed

export * from './validation';
/**
 * Format a date string to locale format
 * @param {string} date - ISO date string
 * @param {string} locale - Locale string (default: 'en-IN')
 * @returns {string} Formatted date
 */
// export const formatDate = (date, locale = 'en-IN') => {
//   return new Date(date).toLocaleDateString(locale);
// };

