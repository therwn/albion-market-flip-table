import { formatInTimeZone } from 'date-fns-tz';

const TURKEY_TIMEZONE = 'Europe/Istanbul';

/**
 * Get current date and time in Turkey timezone
 */
export function getTurkeyDateTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TURKEY_TIMEZONE }));
}

/**
 * Format date to Turkey timezone string
 */
export function formatTurkeyDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatInTimeZone(dateObj, TURKEY_TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Format date to readable Turkish format
 */
export function formatTurkeyDateReadable(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatInTimeZone(dateObj, TURKEY_TIMEZONE, 'dd MMMM yyyy, HH:mm');
}
