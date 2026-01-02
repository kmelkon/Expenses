import { addMonths, endOfMonth, format, subMonths } from "date-fns";

/**
 * Format a Date as `YYYY-MM`.
 *
 * @returns A string representing the year and month in `YYYY-MM` format
 */
export function toYYYYMM(date: Date): string {
  return format(date, "yyyy-MM");
}

/**
 * Format a Date as YYYY-MM-DD.
 *
 * @returns The date formatted as `YYYY-MM-DD`.
 */
export function toYYYYMMDD(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Return the start and end dates for the specified month.
 *
 * @param yyyyMM - Month in `YYYY-MM` format
 * @returns A tuple with the month's start date and end date as `YYYY-MM-DD` strings: `[startDate, endDate]`
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
 * Return the current month in YYYY-MM format.
 *
 * @returns The current month formatted as `YYYY-MM`
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
 * Formats a YYYY-MM month string for display as a full month name and year.
 *
 * @param yyyyMM - Month in `YYYY-MM` format
 * @returns The month and year formatted for display (e.g., "October 2025")
 */
export function formatMonthDisplay(yyyyMM: string): string {
  const year = parseInt(yyyyMM.substring(0, 4));
  const month = parseInt(yyyyMM.substring(5, 7)) - 1; // JS months are 0-based

  const date = new Date(year, month, 1);
  return format(date, "MMMM yyyy");
}

/**
 * Format a `YYYY-MM-DD` date string for display as a short month and day (e.g., "Oct 15").
 *
 * @param yyyyMMDD - Date string in `YYYY-MM-DD` format
 * @returns The formatted date (for example, `Oct 15`)
 */
export function formatExpenseDate(yyyyMMDD: string): string {
  const [year, month, day] = yyyyMMDD.split("-").map(Number);
  const date = new Date(year, month - 1, day); // JS months are 0-based
  return format(date, "MMM d");
}