"use client";

import { useMemo } from "react";
import type { ExpenseRow, PayerRow } from "@expenses/shared";
import { formatAmount, formatExpenseDate } from "@expenses/shared";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface ExpenseListProps {
  expenses: ExpenseRow[];
  payers: PayerRow[];
  onRefresh: () => void;
}

interface GroupedExpenses {
  date: string;
  displayDate: string;
  expenses: ExpenseRow[];
}

// Get 2-letter category initials
function getCategoryInitials(category: string): string {
  return category.slice(0, 2).toUpperCase();
}

// Category badge color mapping
const categoryColors: Record<string, { bg: string; text: string }> = {
  Food: { bg: "bg-[var(--pastel-category-food)]", text: "text-[#C0392B]" },
  Transport: { bg: "bg-[var(--pastel-category-transport)]", text: "text-[#2471A3]" },
  Utilities: { bg: "bg-[var(--pastel-category-utilities)]", text: "text-[#B7950B]" },
  Entertainment: { bg: "bg-[var(--pastel-category-entertainment)]", text: "text-[#7D3C98]" },
  Shopping: { bg: "bg-[var(--pastel-category-shopping)]", text: "text-[#1E8449]" },
};

function getCategoryStyle(category: string) {
  return categoryColors[category] || {
    bg: "bg-[var(--pastel-category-other)]",
    text: "text-[#566573]",
  };
}

// Payer tag colors
const payerTagColors = [
  { bg: "bg-[var(--terracotta-100)]", text: "text-[var(--terracotta-700)]" },
  { bg: "bg-[var(--sage-100)]", text: "text-[var(--sage-700)]" },
];

export function ExpenseList({ expenses, payers, onRefresh }: ExpenseListProps) {
  const supabase = createClient();

  const getPayerName = (id: string) =>
    payers.find((p) => p.id === id)?.display_name || id;

  const getPayerColorIndex = (id: string) =>
    payers.findIndex((p) => p.id === id) % payerTagColors.length;

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;

    await supabase
      .from("expenses")
      .update({ deleted: true, updated_at: new Date().toISOString() })
      .eq("id", id);

    onRefresh();
  };

  // Group expenses by date
  const groupedExpenses = useMemo<GroupedExpenses[]>(() => {
    const groups: Record<string, ExpenseRow[]> = {};

    expenses.forEach((expense) => {
      if (!groups[expense.date]) {
        groups[expense.date] = [];
      }
      groups[expense.date].push(expense);
    });

    return Object.entries(groups)
      .map(([date, exps]) => ({
        date,
        displayDate: formatExpenseDate(date),
        expenses: exps,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <Card variant="peach" className="p-8 text-center" data-testid="expense-list-empty">
        <p className="text-[var(--warm-600)]">No expenses this month</p>
        <p className="text-sm text-[var(--warm-500)] mt-1">
          Tap the + button to add one
        </p>
      </Card>
    );
  }

  return (
    <Card variant="peach" className="overflow-hidden" data-testid="expense-list-card">
      {groupedExpenses.map((group, groupIdx) => (
        <div key={group.date}>
          {/* Date Header */}
          <p
            className={cn(
              "text-sm font-semibold text-[var(--warm-600)] px-4 py-2 bg-white/30",
              groupIdx > 0 && "border-t border-[var(--warm-200)]"
            )}
          >
            {group.displayDate}
          </p>

          {/* Expenses for this date */}
          <div className="divide-y divide-[var(--warm-200)]">
            {group.expenses.map((expense) => {
              const categoryStyle = getCategoryStyle(expense.category);
              const payerColorIdx = getPayerColorIndex(expense.paid_by);
              const payerStyle = payerTagColors[payerColorIdx] || payerTagColors[0];

              return (
                <div
                  key={expense.id}
                  className="p-4 hover:bg-white/30 transition-colors"
                >
                  {/* Line 1: Category Badge, Note/Merchant, Amount, Delete */}
                  <div className="flex items-center gap-3 mb-1">
                    {/* Category Badge - 2 letters */}
                    <span
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0",
                        categoryStyle.bg,
                        categoryStyle.text
                      )}
                    >
                      {getCategoryInitials(expense.category)}
                    </span>

                    {/* Note/Merchant placeholder */}
                    <span className="flex-1 text-[var(--warm-800)] font-medium truncate">
                      {expense.note || "—"}
                    </span>

                    {/* Amount */}
                    <span className="font-semibold text-[var(--warm-900)] flex-shrink-0">
                      -{formatAmount(expense.amount_cents)}
                    </span>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-1.5 text-[var(--warm-400)] hover:text-[var(--color-error)] hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                      aria-label="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Line 2: Category • Date, Payer Tag */}
                  <div className="flex items-center justify-between ml-11">
                    <span className="text-sm text-[var(--warm-500)]">
                      {expense.category}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        payerStyle.bg,
                        payerStyle.text
                      )}
                    >
                      {getPayerName(expense.paid_by)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* View All Transactions Button */}
      <div className="p-4 border-t border-[var(--warm-200)]">
        <Button variant="ghost" className="w-full text-[var(--warm-600)]">
          View All Transactions
        </Button>
      </div>
    </Card>
  );
}
