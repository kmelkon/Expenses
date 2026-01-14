import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExpenseList } from "./expense-list";
import type { ExpenseRow, PayerRow } from "@expenses/shared";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    }),
  }),
}));

// Mock shared utils
vi.mock("@expenses/shared", async () => {
  const actual = await vi.importActual("@expenses/shared");
  return {
    ...actual,
    formatExpenseDate: (date: string) => {
      const [, month, day] = date.split("-");
      return `${day}/${month}`;
    },
  };
});

const mockPayers: PayerRow[] = [
  { id: "payer-1", display_name: "Alice", created_at: "2024-01-01" },
  { id: "payer-2", display_name: "Bob", created_at: "2024-01-01" },
];

const mockExpenses: ExpenseRow[] = [
  {
    id: "exp-1",
    amount_cents: 15000,
    paid_by: "payer-1",
    date: "2024-10-15",
    note: "Groceries at ICA",
    category: "Food",
    created_at: "2024-10-15T10:00:00Z",
    updated_at: "2024-10-15T10:00:00Z",
    deleted: false,
  },
  {
    id: "exp-2",
    amount_cents: 8500,
    paid_by: "payer-2",
    date: "2024-10-15",
    note: null,
    category: "Transport",
    created_at: "2024-10-15T11:00:00Z",
    updated_at: "2024-10-15T11:00:00Z",
    deleted: false,
  },
  {
    id: "exp-3",
    amount_cents: 5000,
    paid_by: "payer-1",
    date: "2024-10-14",
    note: "Coffee",
    category: "Entertainment",
    created_at: "2024-10-14T09:00:00Z",
    updated_at: "2024-10-14T09:00:00Z",
    deleted: false,
  },
];

const mockOnRefresh = vi.fn();

describe("ExpenseList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("wraps transactions in a peach-colored card", () => {
    render(
      <ExpenseList
        expenses={mockExpenses}
        payers={mockPayers}
        onRefresh={mockOnRefresh}
      />
    );
    const card = screen.getByTestId("expense-list-card");
    expect(card).toHaveClass("bg-[var(--pastel-peach)]");
  });

  it("keeps date grouping with date headers", () => {
    render(
      <ExpenseList
        expenses={mockExpenses}
        payers={mockPayers}
        onRefresh={mockOnRefresh}
      />
    );
    // Should have date headers
    expect(screen.getByText("15/10")).toBeInTheDocument();
    expect(screen.getByText("14/10")).toBeInTheDocument();
  });

  it("shows category badge with 2-letter initials", () => {
    render(
      <ExpenseList
        expenses={mockExpenses}
        payers={mockPayers}
        onRefresh={mockOnRefresh}
      />
    );
    // Category initials
    expect(screen.getByText("FO")).toBeInTheDocument(); // Food
    expect(screen.getByText("TR")).toBeInTheDocument(); // Transport
    expect(screen.getByText("EN")).toBeInTheDocument(); // Entertainment
  });

  it("shows payer tag as colored pill", () => {
    render(
      <ExpenseList
        expenses={mockExpenses}
        payers={mockPayers}
        onRefresh={mockOnRefresh}
      />
    );
    // Payer tags should be visible
    const aliceTags = screen.getAllByText("Alice");
    const bobTags = screen.getAllByText("Bob");
    expect(aliceTags.length).toBeGreaterThan(0);
    expect(bobTags.length).toBeGreaterThan(0);
  });

  it("keeps delete button visible", () => {
    render(
      <ExpenseList
        expenses={mockExpenses}
        payers={mockPayers}
        onRefresh={mockOnRefresh}
      />
    );
    const deleteButtons = screen.getAllByRole("button", {
      name: /delete expense/i,
    });
    expect(deleteButtons.length).toBe(3);
  });

  it("shows View All Transactions button at bottom", () => {
    render(
      <ExpenseList
        expenses={mockExpenses}
        payers={mockPayers}
        onRefresh={mockOnRefresh}
      />
    );
    expect(
      screen.getByRole("button", { name: /view all transactions/i })
    ).toBeInTheDocument();
  });

  it("shows note or em-dash placeholder", () => {
    render(
      <ExpenseList
        expenses={mockExpenses}
        payers={mockPayers}
        onRefresh={mockOnRefresh}
      />
    );
    // Should show notes for expenses that have them
    expect(screen.getByText("Groceries at ICA")).toBeInTheDocument();
    expect(screen.getByText("Coffee")).toBeInTheDocument();
    // Expense without note should show em-dash
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("uses peach variant for empty state", () => {
    render(
      <ExpenseList expenses={[]} payers={mockPayers} onRefresh={mockOnRefresh} />
    );
    const card = screen.getByTestId("expense-list-empty");
    expect(card).toHaveClass("bg-[var(--pastel-peach)]");
  });
});
