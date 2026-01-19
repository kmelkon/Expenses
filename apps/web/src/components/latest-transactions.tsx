import Link from "next/link";
import { Card, Badge } from "./ui";
import type { ExpenseRow, PayerRow } from "@expenses/shared";
import { formatSEKParts } from "@expenses/shared";
import { format, isToday, isYesterday } from "date-fns";

interface LatestTransactionsProps {
  expenses: ExpenseRow[];
  payers: PayerRow[];
  limit?: number;
}

// Assign colors to payers based on index
const payerColorVariants = ["lavender", "warning", "mint", "blue"] as const;

// Get initials from a string (for merchant icon placeholder)
function getInitials(text: string): string {
  const words = text.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return text.slice(0, 2).toUpperCase();
}

// Format date for display
function formatTransactionDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

export function LatestTransactions({
  expenses,
  payers,
  limit = 4,
}: LatestTransactionsProps) {
  const displayExpenses = expenses.slice(0, limit);

  // Create payer lookup
  const payerMap = new Map(payers.map((p, i) => [p.id, { ...p, index: i }]));

  return (
    <Card variant="lavender" hover>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-charcoal-text">
          Latest Transactions
        </h3>
        <Link
          href="/expenses"
          className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center hover:bg-white transition-colors"
        >
          <span className="material-symbols-outlined text-charcoal-text text-sm">
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {displayExpenses.length === 0 ? (
          <p className="text-light-grey-text text-center py-8">
            No transactions yet
          </p>
        ) : (
          displayExpenses.map((expense) => {
            const payer = payerMap.get(expense.paid_by);
            const payerColorIndex = payer?.index ?? 0;
            const payerColor =
              payerColorVariants[payerColorIndex % payerColorVariants.length];
            const { kronor, ore } = formatSEKParts(expense.amount_cents);

            return (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-white/60 hover:bg-white rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  {/* Merchant icon placeholder */}
                  <div className="w-12 h-12 rounded-full bg-pastel-mint/50 flex items-center justify-center text-charcoal-text font-bold text-xs">
                    {getInitials(expense.note || expense.category)}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-charcoal-text text-base font-bold">
                      {expense.note || expense.category}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-light-grey-text text-xs font-semibold">
                        {expense.category}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-light-grey-text" />
                      <span className="text-light-grey-text text-xs">
                        {formatTransactionDate(expense.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-charcoal-text text-base font-bold">
                    {kronor}.{ore}
                  </p>
                  <Badge variant={payerColor}>{payer?.display_name || "Unknown"}</Badge>
                </div>
              </div>
            );
          })
        )}
      </div>

      {expenses.length > limit && (
        <Link
          href="/expenses"
          className="block w-full mt-6 py-3 text-sm font-bold text-charcoal-text/60 hover:text-charcoal-text hover:bg-white/40 rounded-xl transition-all text-center"
        >
          View All Transactions
        </Link>
      )}
    </Card>
  );
}
