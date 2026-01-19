/**
 * Convert cents to formatted SEK string
 * @param cents - Amount in cents (e.g., 12345 for 123.45 SEK)
 * @returns Formatted currency string (e.g., "123.45 SEK")
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
 * Convert cents to display amount for input field
 * @param cents - Amount in cents
 * @returns String representation for input field (e.g., "123.45")
 */
export function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Format cents to SEK parts for split styling
 * @param cents - Amount in cents (e.g., 12345 for 123.45 SEK)
 * @returns Object with kronor and öre as formatted strings
 */
export function formatSEKParts(cents: number): { kronor: string; ore: string } {
  const kronor = Math.floor(cents / 100);
  const ore = cents % 100;
  return {
    kronor: kronor.toLocaleString("sv-SE"),
    ore: String(ore).padStart(2, "0"),
  };
}
