import { format, toZonedTime } from 'date-fns-tz';
import { addDays, subDays, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';

export const TIMEZONE = 'Asia/Kolkata';

/**
 * Returns today's date string in Asia/Kolkata timezone as "YYYY-MM-DD"
 */
export const todayIST = (date: Date = new Date()): string => {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return format(zonedDate, 'yyyy-MM-dd', { timeZone: TIMEZONE });
};

/**
 * Returns current Date in IST
 */
export const nowIST = (date: Date = new Date()): Date => {
  return toZonedTime(date, TIMEZONE);
};

/**
 * Formats a date into a human readable IST string e.g. "12 Mar 2026"
 */
export const formatDisplayDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(toZonedTime(d, TIMEZONE), 'dd MMM yyyy', { timeZone: TIMEZONE });
};

/**
 * Formats a date with time into IST string e.g. "12 Mar 2026, 07:30 PM"
 */
export const formatDisplayDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(toZonedTime(d, TIMEZONE), 'dd MMM yyyy, hh:mm a', { timeZone: TIMEZONE });
};

/**
 * Calculate difference in calendar days between today and target date in IST
 */
export const calculateDaysUntil = (targetDate: Date | string): number => {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const targetZoned = toZonedTime(target, TIMEZONE);
  const nowZoned = toZonedTime(new Date(), TIMEZONE);

  const diffMs = targetZoned.getTime() - nowZoned.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export { addDays, subDays, startOfDay, endOfDay, isAfter, isBefore };
