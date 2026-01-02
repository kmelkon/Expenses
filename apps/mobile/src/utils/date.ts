import { addMonths, endOfMonth, format, subMonths } from "date-fns";

/**
 * Convert a Date to YYYY-MM format
 * @param date - Date object
 * @returns String in YYYY-MM format
 */
export function toYYYYMM(date: Date): string {
  return format(date, "yyyy-MM");
}

/**
 * Convert a Date to YYYY-MM-DD format
 * @param date - Date object
 * @returns String in YYYY-MM-DD format
 */
export function toYYYYMMDD(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Get month boundaries for a given YYYY-MM string
 * @param yyyyMM - Month in YYYY-MM format
 * @returns Array with [startISO, endISO] for the month
 */
export function monthBounds(yyyyMM: string): [string, string] {
  const year = parseInt(yyyyMM.substring(0, 4));
  const month = parseInt(yyyyMM.substring(5, 7)) - 1; // JS months are 0-based

  const monthStart = new Date(year, month, 1);
  const monthEnd = endOfMonth(monthStart);

  return [toYYYYMMDD(monthStart), toYYYYMMDD(monthEnd)];
}

/**
 * Get the previous month in YYYY-MM format
 * @param yyyyMM - Current month in YYYY-MM format
 * @returns Previous month in YYYY-MM format
 */
export function getPreviousMonth(yyyyMM: string): string {
  const year = parseInt(yyyyMM.substring(0, 4));
  const month = parseInt(yyyyMM.substring(5, 7)) - 1; // JS months are 0-based

  const currentDate = new Date(year, month, 1);
  const previousMonth = subMonths(currentDate, 1);

  return toYYYYMM(previousMonth);
}

/**
 * Get the next month in YYYY-MM format
 * @param yyyyMM - Current month in YYYY-MM format
 * @returns Next month in YYYY-MM format
 */
export function getNextMonth(yyyyMM: string): string {
  const year = parseInt(yyyyMM.substring(0, 4));
  const month = parseInt(yyyyMM.substring(5, 7)) - 1; // JS months are 0-based

  const currentDate = new Date(year, month, 1);
  const nextMonth = addMonths(currentDate, 1);

  return toYYYYMM(nextMonth);
}

/**
 * Get current month in YYYY-MM format
 * @returns Current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  return toYYYYMM(new Date());
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns Today's date in YYYY-MM-DD format
 */
export function getTodayYYYYMMDD(): string {
  return toYYYYMMDD(new Date());
}

/**
 * Format a month string for display
 * @param yyyyMM - Month in YYYY-MM format
 * @returns Formatted month name (e.g., "October 2025")
 */
export function formatMonthDisplay(yyyyMM: string): string {
  const year = parseInt(yyyyMM.substring(0, 4));
  const month = parseInt(yyyyMM.substring(5, 7)) - 1; // JS months are 0-based

  const date = new Date(year, month, 1);
  return format(date, "MMMM yyyy");
}

/**
 * Format a date for display in the expense list
 * @param yyyyMMDD - Date in YYYY-MM-DD format
 * @returns Formatted date (e.g., "Oct 15")
 */
export function formatExpenseDate(yyyyMMDD: string): string {
  const [year, month, day] = yyyyMMDD.split("-").map(Number);
  const date = new Date(year, month - 1, day); // JS months are 0-based
  return format(date, "MMM d");
}
