/**
 * Format an amount in cents as an SEK currency string.
 *
 * @param cents - Amount in cents (for example, 12345 represents 123.45 SEK)
 * @returns A string with the amount formatted to two decimal places followed by " SEK" (for example, "123.45 SEK")
 */
export function formatSEK(cents: number): string {
  const amount = cents / 100;
  return `${amount.toFixed(2)} SEK`;
}

/**
 * Format cents to SEK currency string using Swedish locale
 * @param cents - Amount in cents (e.g., 1234 for 12.34 SEK)
 * @returns Formatted currency string (e.g., "12,34")
 */
export const formatAmount = (cents: number): string =>
  new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);

/**
 * Parse amount input string to cents
 * @param s - Input string like "12.34" or "12,34"
 * @returns Amount in cents or null if invalid
 */
export const parseAmountInput = (s: string): number | null => {
  const cleaned = s.replace(",", ".").replace(/[^\d.]/g, "");
  const normalized = cleaned.replace(/(\..*?)\./g, "$1"); // one dot
  const num = Number(normalized);
  if (Number.isNaN(num)) return null;
  return Math.round(num * 100);
};

/**
 * Converts an amount in cents to a string suitable for a numeric input field.
 *
 * @param cents - Amount in cents (integer)
 * @returns A string with exactly two decimal places representing kronor (e.g., "123.45")
 */
export function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2);
}