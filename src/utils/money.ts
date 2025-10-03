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
 * Convert formatted amount input to cents
 * @param input - String like "123.45" or "123"
 * @returns Amount in cents (e.g., 12345)
 * @throws Error if input is invalid
 */
export function parseAmountInput(input: string): number {
  const cleaned = input.trim().replace(",", ".");
  const amount = parseFloat(cleaned);

  if (isNaN(amount) || amount < 0) {
    throw new Error("Invalid amount");
  }

  return Math.round(amount * 100);
}

/**
 * Convert cents to display amount for input field
 * @param cents - Amount in cents
 * @returns String representation for input field (e.g., "123.45")
 */
export function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2);
}
