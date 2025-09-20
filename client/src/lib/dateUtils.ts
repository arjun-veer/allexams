import { format } from 'date-fns';

/**
 * Formats a date for display in Indian locale
 * @param date - The date to format
 * @returns Formatted date string (e.g., "15 Jan, 2024")
 */
export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Formats a date that might be undefined
 * @param date - The date to format (can be undefined)
 * @returns Formatted date string or "Not announced"
 */
export const formatDateOptional = (date: Date | undefined) => {
  if (!date) return "Not announced";
  return format(new Date(date), "dd MMM, yyyy");
};

/**
 * Formats a date for database storage (ISO format)
 * @param date - The date to format
 * @returns ISO date string or null if date is undefined
 */
export const formatDateForDb = (date: Date | undefined) => {
  return date ? date.toISOString() : null;
};

/**
 * Formats a date string from the database
 * @param dateString - The date string from database
 * @returns Formatted date string or "Not set"
 */
export const formatDateFromDb = (dateString: string | null) => {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};
