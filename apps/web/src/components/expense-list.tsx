"use client";

import { useMemo } from "react";
import type { ExpenseRow, PayerRow } from "@expenses/shared";
import { formatAmount, formatExpenseDate } from "@expenses/shared";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
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

export function ExpenseList({ expenses, payers, onRefresh }: ExpenseListProps) {
  const supabase = createClient();

  const getPayerName = (id: string) =>
    payers.find(p => p.id === id)?.display_name || id;

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

    expenses.forEach(expense => {
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
      <Card className="p-8 text-center">
        <p className="text-[var(--warm-500)]">No expenses this month</p>
        <p className="text-sm text-[var(--warm-400)] mt-1">
          Tap the + button to add one
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {groupedExpenses.map(group => (
        <div key={group.date}>
          {/* Date Header */}
          <p className="text-sm font-medium text-[var(--warm-500)] mb-2 px-1">
            {group.displayDate}
          </p>

          {/* Expenses for this date */}
          <Card className="divide-y divide-[var(--warm-100)] overflow-hidden">
            {group.expenses.map(expense => (
              <div
                key={expense.id}
                className="p-4 flex items-center gap-4 hover:bg-[var(--warm-50)] transition-colors"
              >
                {/* Payer Avatar */}
                <Avatar
                  name={getPayerName(expense.paid_by)}
                  size="sm"
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "text-xs px-2.5 py-0.5 rounded-full font-medium",
                        "bg-[var(--sage-100)] text-[var(--sage-700)]"
                      )}
                    >
                      {expense.category}
                    </span>
                    {expense.note && (
                      <span className="text-sm text-[var(--warm-600)] truncate">
                        {expense.note}
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <p className="font-semibold text-[var(--warm-900)]">
                    {formatAmount(expense.amount_cents)}
                  </p>
                  <p className="text-xs text-[var(--warm-500)]">
                    {getPayerName(expense.paid_by)}
                  </p>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="p-2 text-[var(--warm-400)] hover:text-[var(--color-error)] hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                  aria-label="Delete expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}
