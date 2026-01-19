// ============================================================================
// SHARED TYPES
// ============================================================================
// Types shared between mobile and web apps

/**
 * Category ID - dynamically loaded from the database
 */
export type Category = string;

/**
 * Payer ID - dynamically loaded from the database
 */
export type PayerId = string;

// ============================================================================
// DATABASE ROW TYPES
// ============================================================================

export interface HouseholdRow {
  id: string;
  name: string;
  join_code: string;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  household_id: string | null;
  email: string;
  display_name: string;
  payer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseRow {
  id: string;
  household_id?: string;
  amount_cents: number;
  paid_by: PayerId;
  date: string; // 'YYYY-MM-DD'
  note: string | null;
  category: Category;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  deleted: boolean;
  created_by?: string;
}

export interface CategoryRow {
  id: string;
  household_id?: string;
  name: string;
  display_order: number;
  icon?: string;
  color?: string;
  created_at: string;
}

export interface PayerRow {
  id: string;
  household_id?: string;
  display_name: string;
  created_at: string;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface AddExpenseInput {
  amount_cents: number;
  paid_by: PayerId;
  date: string; // 'YYYY-MM-DD'
  note?: string;
  category: Category;
}

export interface UpdateExpenseInput {
  id: string;
  amount_cents: number;
  paid_by: PayerId;
  date: string; // 'YYYY-MM-DD'
  note?: string;
  category: Category;
}

// ============================================================================
// SUMMARY TYPES
// ============================================================================

export interface PersonTotal {
  paid_by: PayerId;
  total: number;
}

export interface CategoryPersonTotal {
  category: Category;
  paid_by: PayerId;
  total: number;
}

export interface MonthSummary {
  totalsByPerson: PersonTotal[];
  totalsByCategory: CategoryPersonTotal[];
  grandTotal: number;
}

// ============================================================================
// EXPORT/IMPORT TYPES
// ============================================================================

export interface DatabaseExport {
  exportedAt: string;
  appVersion: string;
  totalExpenses: number;
  expenses: ExpenseRow[];
  categories?: CategoryRow[];
  payers?: PayerRow[];
}
