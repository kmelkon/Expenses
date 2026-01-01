"use client";

import type { ExpenseRow, PayerRow } from "@expenses/shared";
import { formatAmount, formatExpenseDate } from "@expenses/shared";
import { createClient } from "@/lib/supabase/client";

interface ExpenseListProps {
  expenses: ExpenseRow[];
  payers: PayerRow[];
  onRefresh: () => void;
}

/**
 * Render an expense list UI that displays each expense with date, category, note, amount, payer, and a delete action.
 *
 * @param expenses - Array of expense rows to display
 * @param payers - Array of payer rows used to resolve payer display names
 * @param onRefresh - Callback invoked after an expense is marked deleted to refresh the data
 * @returns The rendered React element for the expense list or an empty-state placeholder when no expenses exist
 */
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

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">No expenses this month</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm divide-y">
      {expenses.map(expense => (
        <div
          key={expense.id}
          className="p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {formatExpenseDate(expense.date)}
              </span>
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                {expense.category}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {expense.note || "No note"}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-900">
              {formatAmount(expense.amount_cents)}
            </p>
            <p className="text-xs text-gray-500">
              {getPayerName(expense.paid_by)}
            </p>
          </div>
          <button
            onClick={() => handleDelete(expense.id)}
            className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Delete expense"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}