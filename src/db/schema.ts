// ============================================================================
// CATEGORIES & PAYERS
// ============================================================================
// Note: Categories and payers are now stored in the database (since migration v2)
// and can be managed dynamically through the settings screen.
// These types are now strings to support user-defined values.
// ============================================================================

/**
 * Category name - now dynamically loaded from the database.
 * Use `useSettingsStore` to get available categories.
 */
export type Category = string;

/**
 * Payer ID - now dynamically loaded from the database.
 * Use `useSettingsStore` to get available payers.
 */
export type PayerId = string;

// ============================================================================
// DEPRECATED - kept for backwards compatibility during migration
// ============================================================================
// These constants represent the default/initial values seeded in migration v2.
// DO NOT use these for validation - fetch from the database instead.

/**
 * @deprecated Use getAllCategories() from expenseRepo instead
 */
export const CATEGORIES = [
  "Groceries",
  "Rent",
  "Mortgage",
  "Electricity",
  "Electricity network",
  "Garbage collection",
  "Internet",
  "Bensin",
  "House insurance",
  "Car insurance",
  "Eating out",
  "Kid",
] as const;

/**
 * @deprecated Use getAllPayers() from expenseRepo instead
 */
export const PAYER_IDS = ["hubby", "wifey"] as const;
