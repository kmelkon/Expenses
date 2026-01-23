import { describe, it, expect } from "vitest";
import type { ExpenseRow, CategoryRow, PayerRow } from "@expenses/shared";
import {
  calculateCumulativeSpending,
  calculateCategoryBreakdown,
  calculateMonthChange,
  calculatePayerBalance,
  calculateSettlement,
  calculateMonthlyTotals,
  calculateCategoryTrends,
} from "./spending-calculations";

// Mock expense factory
function createExpense(overrides: Partial<ExpenseRow> = {}): ExpenseRow {
  return {
    id: "exp-1",
    amount_cents: 1000,
    paid_by: "payer-1",
    date: "2025-01-15",
    note: null,
    category: "Groceries",
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-15T10:00:00Z",
    deleted: false,
    ...overrides,
  };
}

// Mock category factory
function createCategory(overrides: Partial<CategoryRow> = {}): CategoryRow {
  return {
    id: "cat-1",
    name: "Groceries",
    display_order: 0,
    created_at: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

// Mock payer factory
function createPayer(overrides: Partial<PayerRow> = {}): PayerRow {
  return {
    id: "payer-1",
    display_name: "Alice",
    created_at: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("calculateCumulativeSpending", () => {
  it("returns all days of the month with cumulative totals", () => {
    const expenses = [
      createExpense({ date: "2025-01-05", amount_cents: 1000 }),
      createExpense({ date: "2025-01-10", amount_cents: 2000 }),
      createExpense({ date: "2025-01-10", amount_cents: 500 }), // Same day
    ];

    const result = calculateCumulativeSpending(expenses, "2025-01");

    expect(result).toHaveLength(31); // January has 31 days
    expect(result[0]).toEqual({ date: "2025-01-01", cumulative: 0 });
    expect(result[4]).toEqual({ date: "2025-01-05", cumulative: 1000 });
    expect(result[9]).toEqual({ date: "2025-01-10", cumulative: 3500 });
    expect(result[30]).toEqual({ date: "2025-01-31", cumulative: 3500 });
  });

  it("handles empty expenses (all zeros)", () => {
    const result = calculateCumulativeSpending([], "2025-02");

    expect(result).toHaveLength(28); // Feb 2025 has 28 days
    expect(result.every(d => d.cumulative === 0)).toBe(true);
  });

  it("handles single expense", () => {
    const expenses = [createExpense({ date: "2025-03-15", amount_cents: 5000 })];
    const result = calculateCumulativeSpending(expenses, "2025-03");

    expect(result).toHaveLength(31);
    expect(result[13].cumulative).toBe(0); // Day 14
    expect(result[14].cumulative).toBe(5000); // Day 15
    expect(result[30].cumulative).toBe(5000); // Day 31
  });

  it("ignores expenses outside the month", () => {
    const expenses = [
      createExpense({ date: "2024-12-31", amount_cents: 1000 }),
      createExpense({ date: "2025-01-15", amount_cents: 2000 }),
      createExpense({ date: "2025-02-01", amount_cents: 3000 }),
    ];

    const result = calculateCumulativeSpending(expenses, "2025-01");

    expect(result[30].cumulative).toBe(2000); // Only January expense counted
  });
});

describe("calculateCategoryBreakdown", () => {
  it("calculates amounts and percentages for each category", () => {
    const expenses = [
      createExpense({ category: "Groceries", amount_cents: 4000 }),
      createExpense({ category: "Groceries", amount_cents: 2000 }),
      createExpense({ category: "Rent", amount_cents: 3000 }),
      createExpense({ category: "Dining", amount_cents: 1000 }),
    ];
    const categories = [
      createCategory({ name: "Groceries", color: "bg-accent-primary" }),
      createCategory({ name: "Rent", color: "bg-accent-success" }),
      createCategory({ name: "Dining", color: "bg-accent-warning" }),
    ];

    const result = calculateCategoryBreakdown(expenses, categories);

    expect(result).toHaveLength(3);
    // Should be sorted by amount descending
    expect(result[0]).toEqual({
      name: "Groceries",
      amount: 6000,
      percentage: 60,
      color: "bg-accent-primary",
    });
    expect(result[1]).toEqual({
      name: "Rent",
      amount: 3000,
      percentage: 30,
      color: "bg-accent-success",
    });
    expect(result[2]).toEqual({
      name: "Dining",
      amount: 1000,
      percentage: 10,
      color: "bg-accent-warning",
    });
  });

  it("handles single category (100%)", () => {
    const expenses = [createExpense({ category: "Groceries", amount_cents: 5000 })];
    const categories = [createCategory({ name: "Groceries" })];

    const result = calculateCategoryBreakdown(expenses, categories);

    expect(result).toHaveLength(1);
    expect(result[0].percentage).toBe(100);
  });

  it("handles empty expenses", () => {
    const categories = [createCategory({ name: "Groceries" })];
    const result = calculateCategoryBreakdown([], categories);

    expect(result).toHaveLength(0);
  });

  it("uses fallback colors when category has no color", () => {
    const expenses = [createExpense({ category: "Groceries", amount_cents: 1000 })];
    const categories = [createCategory({ name: "Groceries", color: undefined })];

    const result = calculateCategoryBreakdown(expenses, categories);

    expect(result[0].color).toBe("bg-accent-primary"); // First fallback color
  });
});

describe("calculateMonthChange", () => {
  it("calculates positive change (up)", () => {
    const result = calculateMonthChange(11200, 10000);

    expect(result).toEqual({ percentChange: 12, direction: "up" });
  });

  it("calculates negative change (down)", () => {
    const result = calculateMonthChange(9200, 10000);

    expect(result).toEqual({ percentChange: 8, direction: "down" });
  });

  it("returns flat for less than 1% change", () => {
    // 0.4% change should be flat (rounds to 0)
    const result = calculateMonthChange(10040, 10000);

    expect(result).toEqual({ percentChange: 0, direction: "flat" });
  });

  it("handles zero previous month", () => {
    const result = calculateMonthChange(5000, 0);

    expect(result).toEqual({ percentChange: 100, direction: "up" });
  });

  it("handles both zero", () => {
    const result = calculateMonthChange(0, 0);

    expect(result).toEqual({ percentChange: 0, direction: "flat" });
  });
});

describe("calculatePayerBalance", () => {
  it("calculates correct balances for equal spending", () => {
    const expenses = [
      createExpense({ paid_by: "payer-1", amount_cents: 5000 }),
      createExpense({ paid_by: "payer-2", amount_cents: 5000 }),
    ];
    const payers = [
      createPayer({ id: "payer-1", display_name: "Alice" }),
      createPayer({ id: "payer-2", display_name: "Bob" }),
    ];

    const result = calculatePayerBalance(expenses, payers);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      payerId: "payer-1",
      payerName: "Alice",
      paid: 5000,
      share: 5000,
      balance: 0,
    });
    expect(result[1]).toEqual({
      payerId: "payer-2",
      payerName: "Bob",
      paid: 5000,
      share: 5000,
      balance: 0,
    });
  });

  it("calculates correct balances for unequal spending", () => {
    const expenses = [
      createExpense({ paid_by: "payer-1", amount_cents: 8000 }),
      createExpense({ paid_by: "payer-2", amount_cents: 2000 }),
    ];
    const payers = [
      createPayer({ id: "payer-1", display_name: "Alice" }),
      createPayer({ id: "payer-2", display_name: "Bob" }),
    ];

    const result = calculatePayerBalance(expenses, payers);

    expect(result[0].paid).toBe(8000);
    expect(result[0].share).toBe(5000);
    expect(result[0].balance).toBe(3000); // Overpaid

    expect(result[1].paid).toBe(2000);
    expect(result[1].share).toBe(5000);
    expect(result[1].balance).toBe(-3000); // Underpaid
  });

  it("handles single payer", () => {
    const expenses = [createExpense({ paid_by: "payer-1", amount_cents: 10000 })];
    const payers = [createPayer({ id: "payer-1", display_name: "Alice" })];

    const result = calculatePayerBalance(expenses, payers);

    expect(result).toHaveLength(1);
    expect(result[0].balance).toBe(0); // Single payer always balanced
  });

  it("handles empty payers", () => {
    const result = calculatePayerBalance([], []);
    expect(result).toHaveLength(0);
  });
});

describe("calculateSettlement", () => {
  it("returns null when balanced", () => {
    const balances = [
      { payerId: "1", payerName: "Alice", paid: 5000, share: 5000, balance: 0 },
      { payerId: "2", payerName: "Bob", paid: 5000, share: 5000, balance: 0 },
    ];

    const result = calculateSettlement(balances);

    expect(result).toBeNull();
  });

  it("returns correct settlement direction", () => {
    const balances = [
      { payerId: "1", payerName: "Alice", paid: 8000, share: 5000, balance: 3000 },
      { payerId: "2", payerName: "Bob", paid: 2000, share: 5000, balance: -3000 },
    ];

    const result = calculateSettlement(balances);

    expect(result).toEqual({
      from: "Bob",
      to: "Alice",
      amount: 3000,
    });
  });

  it("returns null for non-2-payer households", () => {
    const balances = [
      { payerId: "1", payerName: "Alice", paid: 3333, share: 3333, balance: 0 },
    ];

    const result = calculateSettlement(balances);

    expect(result).toBeNull();
  });
});

describe("calculateMonthlyTotals", () => {
  it("calculates totals for each month", () => {
    const expensesByMonth = new Map([
      ["2025-01", [
        createExpense({ amount_cents: 1000 }),
        createExpense({ amount_cents: 2000 }),
      ]],
      ["2025-02", [
        createExpense({ amount_cents: 3000 }),
      ]],
    ]);

    const result = calculateMonthlyTotals(expensesByMonth);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ month: "2025-01", label: "Jan", total: 3000 });
    expect(result[1]).toEqual({ month: "2025-02", label: "Feb", total: 3000 });
  });

  it("handles empty months", () => {
    const expensesByMonth = new Map([
      ["2025-01", []],
    ]);

    const result = calculateMonthlyTotals(expensesByMonth);

    expect(result[0].total).toBe(0);
  });
});

describe("calculateCategoryTrends", () => {
  it("calculates category totals per month", () => {
    const expensesByMonth = new Map([
      ["2025-01", [
        createExpense({ category: "Groceries", amount_cents: 1000 }),
        createExpense({ category: "Rent", amount_cents: 2000 }),
      ]],
      ["2025-02", [
        createExpense({ category: "Groceries", amount_cents: 1500 }),
      ]],
    ]);
    const categories = [
      createCategory({ name: "Groceries", color: "bg-accent-primary" }),
      createCategory({ name: "Rent", color: "bg-accent-success" }),
    ];

    const result = calculateCategoryTrends(expensesByMonth, categories);

    expect(result).toHaveLength(2);
    expect(result[0].month).toBe("2025-01");
    expect(result[0].categories).toContainEqual({
      name: "Groceries",
      total: 1000,
      color: "bg-accent-primary",
    });
    expect(result[0].categories).toContainEqual({
      name: "Rent",
      total: 2000,
      color: "bg-accent-success",
    });

    // February has no Rent expenses
    expect(result[1].categories.find(c => c.name === "Rent")?.total).toBe(0);
    expect(result[1].categories.find(c => c.name === "Groceries")?.total).toBe(1500);
  });

  it("handles missing category in some months (treats as 0)", () => {
    const expensesByMonth = new Map([
      ["2025-01", [createExpense({ category: "Groceries", amount_cents: 1000 })]],
    ]);
    const categories = [
      createCategory({ name: "Groceries" }),
      createCategory({ name: "Rent" }),
    ];

    const result = calculateCategoryTrends(expensesByMonth, categories);

    expect(result[0].categories.find(c => c.name === "Rent")?.total).toBe(0);
  });
});
