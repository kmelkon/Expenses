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
 * Split cents into main amount and decimal parts for styled display
 * @param cents - Amount in cents
 * @returns Object with main and decimal parts as strings
 */
export function splitAmount(cents: number): { main: string; decimal: string } {
  const amount = cents / 100;
  const [main, decimal = "00"] = amount.toFixed(2).split(".");
  // Format main with Swedish locale (non-breaking space for thousands)
  // Replace non-breaking space with regular space for consistency
  const formattedMain = new Intl.NumberFormat("sv-SE", {
    maximumFractionDigits: 0,
  })
    .format(parseInt(main))
    .replace(/\u00A0/g, " ");
  return {
    main: formattedMain,
    decimal: decimal,
  };
}

export type TrendDirection = "up" | "down" | "neutral";

/**
 * Calculate percentage change between two values
 * @param current - Current month total in cents
 * @param previous - Previous month total in cents
 * @returns Object with percentage change and direction
 */
export function calculateTrendPercentage(
  current: number,
  previous: number
): { percentage: number; direction: TrendDirection } {
  if (previous === 0) {
    return { percentage: 0, direction: "neutral" };
  }
  const change = ((current - previous) / previous) * 100;
  if (change === 0) {
    return { percentage: 0, direction: "neutral" };
  }
  return {
    percentage: Math.abs(Math.round(change)),
    direction: change > 0 ? "up" : "down",
  };
}
