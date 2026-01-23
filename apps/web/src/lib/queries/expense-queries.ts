import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExpenseRow } from "@expenses/shared";
import { monthBounds, getPreviousMonth } from "@expenses/shared";

/**
 * Get expenses for a date range
 */
export async function getExpensesForRange(
  supabase: SupabaseClient,
  householdId: string,
  startDate: string,
  endDate: string
): Promise<ExpenseRow[]> {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("household_id", householdId)
    .eq("deleted", false)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get expenses for a specific month (YYYY-MM format)
 */
export async function getExpensesForMonth(
  supabase: SupabaseClient,
  householdId: string,
  month: string
): Promise<ExpenseRow[]> {
  const [startDate, endDate] = monthBounds(month);
  return getExpensesForRange(supabase, householdId, startDate, endDate);
}

/**
 * Get expenses for multiple months
 * Returns a Map keyed by YYYY-MM
 */
export async function getExpensesForMonths(
  supabase: SupabaseClient,
  householdId: string,
  months: string[]
): Promise<Map<string, ExpenseRow[]>> {
  if (months.length === 0) return new Map();

  // Get the overall date range
  const allBounds = months.map(m => monthBounds(m));
  const startDate = allBounds.reduce((min, [s]) => s < min ? s : min, allBounds[0][0]);
  const endDate = allBounds.reduce((max, [, e]) => e > max ? e : max, allBounds[0][1]);

  const expenses = await getExpensesForRange(supabase, householdId, startDate, endDate);

  // Group by month
  const result = new Map<string, ExpenseRow[]>();
  for (const month of months) {
    result.set(month, []);
  }

  for (const expense of expenses) {
    const expenseMonth = expense.date.substring(0, 7); // YYYY-MM
    if (result.has(expenseMonth)) {
      result.get(expenseMonth)!.push(expense);
    }
  }

  return result;
}

/**
 * Get expenses for current month and previous month (for trend calculation)
 */
export async function getExpensesWithPreviousMonth(
  supabase: SupabaseClient,
  householdId: string,
  currentMonth: string
): Promise<{ current: ExpenseRow[]; previous: ExpenseRow[] }> {
  const previousMonth = getPreviousMonth(currentMonth);
  const expenseMap = await getExpensesForMonths(supabase, householdId, [currentMonth, previousMonth]);

  return {
    current: expenseMap.get(currentMonth) || [],
    previous: expenseMap.get(previousMonth) || [],
  };
}
