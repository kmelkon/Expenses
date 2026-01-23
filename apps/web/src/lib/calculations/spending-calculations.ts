import type { ExpenseRow, CategoryRow, PayerRow } from "@expenses/shared";
import { monthBounds } from "@expenses/shared";

/**
 * Cumulative daily spending data point
 */
export interface CumulativeDataPoint {
  date: string; // YYYY-MM-DD
  cumulative: number; // cents
}

/**
 * Category breakdown item
 */
export interface CategoryBreakdownItem {
  name: string;
  amount: number; // cents
  percentage: number; // 0-100
  color: string; // Tailwind class
}

/**
 * Month-over-month change result
 */
export interface MonthChange {
  percentChange: number;
  direction: "up" | "down" | "flat";
}

/**
 * Payer balance item
 */
export interface PayerBalance {
  payerId: string;
  payerName: string;
  paid: number; // cents
  share: number; // cents (fair share)
  balance: number; // cents (positive = overpaid/owed money, negative = underpaid/owes)
}

/**
 * Calculate cumulative daily spending for a month
 */
export function calculateCumulativeSpending(
  expenses: ExpenseRow[],
  month: string
): CumulativeDataPoint[] {
  const [startDate, endDate] = monthBounds(month);

  // Create a map of date -> total spending for that day
  const dailyTotals = new Map<string, number>();

  for (const expense of expenses) {
    if (expense.date >= startDate && expense.date <= endDate) {
      const current = dailyTotals.get(expense.date) || 0;
      dailyTotals.set(expense.date, current + expense.amount_cents);
    }
  }

  // Generate all dates in the month
  const dates: string[] = [];
  const [year, monthNum] = month.split("-").map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(`${month}-${String(day).padStart(2, "0")}`);
  }

  // Calculate cumulative totals
  let cumulative = 0;
  return dates.map(date => {
    cumulative += dailyTotals.get(date) || 0;
    return { date, cumulative };
  });
}

/**
 * Default color palette for categories
 */
const categoryColorPalette = [
  "bg-accent-primary",
  "bg-accent-success",
  "bg-accent-warning",
  "bg-pastel-lavender",
  "bg-pastel-blue",
  "bg-pastel-mint",
  "bg-pastel-peach",
];

/**
 * Calculate category breakdown with amounts and percentages
 */
export function calculateCategoryBreakdown(
  expenses: ExpenseRow[],
  categories: CategoryRow[]
): CategoryBreakdownItem[] {
  // Calculate total per category
  const categoryTotals = new Map<string, number>();

  for (const expense of expenses) {
    const current = categoryTotals.get(expense.category) || 0;
    categoryTotals.set(expense.category, current + expense.amount_cents);
  }

  const grandTotal = expenses.reduce((sum, e) => sum + e.amount_cents, 0);

  // Build breakdown items sorted by amount descending
  const items: CategoryBreakdownItem[] = [];

  for (const category of categories) {
    const amount = categoryTotals.get(category.name) || 0;
    if (amount > 0) {
      items.push({
        name: category.name,
        amount,
        percentage: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
        color: category.color || categoryColorPalette[items.length % categoryColorPalette.length],
      });
    }
  }

  // Sort by amount descending
  items.sort((a, b) => b.amount - a.amount);

  return items;
}

/**
 * Calculate month-over-month change percentage
 */
export function calculateMonthChange(
  currentTotal: number,
  previousTotal: number
): MonthChange {
  if (previousTotal === 0) {
    if (currentTotal === 0) {
      return { percentChange: 0, direction: "flat" };
    }
    // Can't calculate percentage from zero, treat as "up" with 100%
    return { percentChange: 100, direction: "up" };
  }

  const percentChange = Math.round(((currentTotal - previousTotal) / previousTotal) * 100);

  if (Math.abs(percentChange) < 1) {
    return { percentChange: 0, direction: "flat" };
  }

  return {
    percentChange: Math.abs(percentChange),
    direction: percentChange > 0 ? "up" : "down",
  };
}

/**
 * Calculate payer balances for expense splitting
 */
export function calculatePayerBalance(
  expenses: ExpenseRow[],
  payers: PayerRow[]
): PayerBalance[] {
  if (payers.length === 0) return [];

  const grandTotal = expenses.reduce((sum, e) => sum + e.amount_cents, 0);
  const fairShare = Math.round(grandTotal / payers.length);

  // Calculate how much each payer paid
  const paidByPayer = new Map<string, number>();
  for (const payer of payers) {
    paidByPayer.set(payer.id, 0);
  }

  for (const expense of expenses) {
    const current = paidByPayer.get(expense.paid_by) || 0;
    paidByPayer.set(expense.paid_by, current + expense.amount_cents);
  }

  return payers.map(payer => {
    const paid = paidByPayer.get(payer.id) || 0;
    return {
      payerId: payer.id,
      payerName: payer.display_name,
      paid,
      share: fairShare,
      balance: paid - fairShare,
    };
  });
}

/**
 * Calculate settlement summary between payers
 */
export function calculateSettlement(
  balances: PayerBalance[]
): { from: string; to: string; amount: number } | null {
  if (balances.length !== 2) return null; // Only support 2-payer households for now

  const [payer1, payer2] = balances;

  // If both are roughly equal (within 1 cent), they're settled
  if (Math.abs(payer1.balance) <= 1 && Math.abs(payer2.balance) <= 1) {
    return null;
  }

  // The underpayer (negative balance) owes the overpayer
  const underpayer = payer1.balance < payer2.balance ? payer1 : payer2;
  const overpayer = payer1.balance < payer2.balance ? payer2 : payer1;

  // Settlement amount is half the difference (since one overpaid and one underpaid)
  const amount = Math.abs(underpayer.balance);

  return {
    from: underpayer.payerName,
    to: overpayer.payerName,
    amount,
  };
}

/**
 * Calculate monthly totals for comparison chart
 */
export function calculateMonthlyTotals(
  expensesByMonth: Map<string, ExpenseRow[]>
): { month: string; label: string; total: number }[] {
  const months = Array.from(expensesByMonth.keys()).sort();

  return months.map(month => {
    const expenses = expensesByMonth.get(month) || [];
    const total = expenses.reduce((sum, e) => sum + e.amount_cents, 0);

    // Get month abbreviation
    const [year, monthNum] = month.split("-").map(Number);
    const date = new Date(year, monthNum - 1, 1);
    const label = date.toLocaleDateString("en-US", { month: "short" });

    return { month, label, total };
  });
}

/**
 * Calculate category trends over multiple months
 */
export function calculateCategoryTrends(
  expensesByMonth: Map<string, ExpenseRow[]>,
  categories: CategoryRow[]
): {
  month: string;
  label: string;
  categories: { name: string; total: number; color: string }[];
}[] {
  const months = Array.from(expensesByMonth.keys()).sort();

  return months.map(month => {
    const expenses = expensesByMonth.get(month) || [];

    // Calculate total per category
    const categoryTotals = new Map<string, number>();
    for (const expense of expenses) {
      const current = categoryTotals.get(expense.category) || 0;
      categoryTotals.set(expense.category, current + expense.amount_cents);
    }

    // Get month abbreviation
    const [year, monthNum] = month.split("-").map(Number);
    const date = new Date(year, monthNum - 1, 1);
    const label = date.toLocaleDateString("en-US", { month: "short" });

    return {
      month,
      label,
      categories: categories.map((cat, index) => ({
        name: cat.name,
        total: categoryTotals.get(cat.name) || 0,
        color: cat.color || categoryColorPalette[index % categoryColorPalette.length],
      })),
    };
  });
}
