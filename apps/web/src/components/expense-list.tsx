"use client";

import type { ExpenseRow, PayerRow } from "@expenses/shared";
import { formatSEKParts } from "@expenses/shared";
import { createClient } from "@/lib/supabase/client";
import { format, isToday, isYesterday, parseISO } from "date-fns";

interface ExpenseListProps {
  expenses: ExpenseRow[];
  payers: PayerRow[];
  onRefresh: () => void;
}

// Map categories to icons and colors
const categoryConfig: Record<
  string,
  { icon: string; color: string; bgColor: string; pillBg: string }
> = {
  groceries: {
    icon: "shopping_cart",
    color: "pastel-mint",
    bgColor: "bg-pastel-mint/50",
    pillBg: "bg-pastel-mint/20",
  },
  dining: {
    icon: "local_cafe",
    color: "pastel-blue",
    bgColor: "bg-pastel-blue/50",
    pillBg: "bg-pastel-blue/20",
  },
  utilities: {
    icon: "bolt",
    color: "accent-warning",
    bgColor: "bg-accent-warning/30",
    pillBg: "bg-accent-warning/10",
  },
  household: {
    icon: "shopping_bag",
    color: "pastel-peach",
    bgColor: "bg-pastel-peach/60",
    pillBg: "bg-pastel-peach/30",
  },
  transport: {
    icon: "local_gas_station",
    color: "pastel-lavender",
    bgColor: "bg-pastel-lavender/50",
    pillBg: "bg-pastel-lavender/30",
  },
  entertainment: {
    icon: "movie",
    color: "pastel-blue",
    bgColor: "bg-accent-primary/20",
    pillBg: "bg-accent-primary/10",
  },
};

const defaultCategoryConfig = {
  icon: "receipt_long",
  color: "pastel-mint",
  bgColor: "bg-pastel-mint/50",
  pillBg: "bg-pastel-mint/20",
};

// Payer badge colors
const payerColorVariants = [
  "bg-pastel-lavender/50",
  "bg-accent-warning/30",
  "bg-pastel-mint/50",
  "bg-pastel-blue/50",
] as const;

// Get initials from a string
function getInitials(text: string): string {
  const words = text.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return text.slice(0, 2).toUpperCase();
}

// Format date for grouping header
function formatGroupDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

// Group expenses by date
function groupExpensesByDate(
  expenses: ExpenseRow[]
): Map<string, ExpenseRow[]> {
  const groups = new Map<string, ExpenseRow[]>();

  for (const expense of expenses) {
    const dateKey = expense.date;
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(expense);
  }

  return groups;
}

export function ExpenseList({ expenses, payers, onRefresh }: ExpenseListProps) {
  const supabase = createClient();

  // Create payer lookup with index for color assignment
  const payerMap = new Map(payers.map((p, i) => [p.id, { ...p, index: i }]));

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
      <div className="bg-white/60 rounded-3xl p-12 text-center">
        <span className="material-symbols-outlined text-4xl text-charcoal-text/30 mb-2">
          receipt_long
        </span>
        <p className="text-light-grey-text">No expenses this month</p>
      </div>
    );
  }

  const groupedExpenses = groupExpensesByDate(expenses);

  return (
    <div className="flex flex-col gap-8">
      {Array.from(groupedExpenses.entries()).map(([date, dateExpenses]) => (
        <div key={date}>
          <h3 className="text-xs font-bold text-light-grey-text uppercase tracking-wider mb-4 pl-2 flex items-center gap-2">
            {formatGroupDate(date)}
            <span className="h-px flex-grow bg-charcoal-text/10" />
          </h3>
          <div className="flex flex-col gap-3">
            {dateExpenses.map((expense) => {
              const payer = payerMap.get(expense.paid_by);
              const payerColorIndex = payer?.index ?? 0;
              const payerColor =
                payerColorVariants[payerColorIndex % payerColorVariants.length];
              const { kronor, ore } = formatSEKParts(expense.amount_cents);

              const categoryKey = expense.category.toLowerCase();
              const catConfig =
                categoryConfig[categoryKey] || defaultCategoryConfig;

              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 bg-white/60 hover:bg-white rounded-2xl transition-all cursor-pointer group shadow-sm hover:shadow-md border border-transparent hover:border-pastel-mint/30"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full ${catConfig.bgColor} flex items-center justify-center text-charcoal-text font-bold text-xs shadow-sm`}
                    >
                      {catConfig.icon !== "receipt_long" ? (
                        <span className="material-symbols-outlined text-base">
                          {catConfig.icon}
                        </span>
                      ) : (
                        getInitials(expense.note || expense.category)
                      )}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-charcoal-text text-base font-bold">
                        {expense.note || expense.category}
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-light-grey-text text-xs font-semibold ${catConfig.pillBg} px-2 py-0.5 rounded-md`}
                        >
                          {expense.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-charcoal-text text-base font-bold">
                        {kronor}.{ore}
                      </p>
                      <span
                        className={`text-[10px] uppercase font-bold text-charcoal-text/50 ${payerColor} px-2 py-0.5 rounded-md tracking-wide`}
                      >
                        {payer?.display_name || "Unknown"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-2 text-charcoal-text/30 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Delete expense"
                    >
                      <span className="material-symbols-outlined text-lg">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
