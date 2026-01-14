import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroTotalCard } from "./hero-total-card";
import type { MonthSummary, PayerRow } from "@expenses/shared";

const mockSummary: MonthSummary = {
  grandTotal: 324050, // 3240.50
  totalsByPerson: [
    { paid_by: "payer-1", total: 200000 }, // 2000.00
    { paid_by: "payer-2", total: 124050 }, // 1240.50
  ],
  totalsByCategory: [],
};

const mockPayers: PayerRow[] = [
  { id: "payer-1", display_name: "Alice", created_at: "2024-01-01" },
  { id: "payer-2", display_name: "Bob", created_at: "2024-01-01" },
];

describe("HeroTotalCard", () => {
  it("displays the total amount split into main and decimal parts", () => {
    render(<HeroTotalCard summary={mockSummary} payers={mockPayers} />);
    // Main part should be "3 240" (Swedish locale formatting)
    expect(screen.getByText("3 240")).toBeInTheDocument();
    // Decimal part should be ",50" (comma + decimal)
    expect(screen.getByText(",50")).toBeInTheDocument();
  });

  it("does NOT show currency symbol in the total", () => {
    render(<HeroTotalCard summary={mockSummary} payers={mockPayers} />);
    expect(screen.queryByText(/SEK/)).not.toBeInTheDocument();
    expect(screen.queryByText(/kr/i)).not.toBeInTheDocument();
  });

  it("shows trend pill when previousMonthTotal is provided", () => {
    render(
      <HeroTotalCard
        summary={mockSummary}
        previousMonthTotal={270000} // 2700.00
        payers={mockPayers}
      />
    );
    // 3240.50 vs 2700.00 = +20%
    expect(screen.getByText(/20%/)).toBeInTheDocument();
    expect(screen.getByText(/vs last month/i)).toBeInTheDocument();
  });

  it("hides trend pill when no previous data", () => {
    render(<HeroTotalCard summary={mockSummary} payers={mockPayers} />);
    expect(screen.queryByText(/vs last month/i)).not.toBeInTheDocument();
  });

  it("shows up direction for increase", () => {
    render(
      <HeroTotalCard
        summary={mockSummary}
        previousMonthTotal={270000}
        payers={mockPayers}
      />
    );
    // Should have TrendingUp icon or up indicator
    expect(screen.getByTestId("trend-up")).toBeInTheDocument();
  });

  it("shows down direction for decrease", () => {
    render(
      <HeroTotalCard
        summary={mockSummary}
        previousMonthTotal={400000} // 4000.00 -> decrease
        payers={mockPayers}
      />
    );
    expect(screen.getByTestId("trend-down")).toBeInTheDocument();
  });

  it("displays per-payer breakdown with names", () => {
    render(<HeroTotalCard summary={mockSummary} payers={mockPayers} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("uses mint variant for the card background", () => {
    render(<HeroTotalCard summary={mockSummary} payers={mockPayers} />);
    const card = screen.getByTestId("hero-total-card");
    expect(card).toHaveClass("bg-[var(--pastel-mint)]");
  });
});
