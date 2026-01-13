"use client";

import type { MonthSummary, PayerRow } from "@expenses/shared";
import { formatAmount } from "@expenses/shared";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

interface TotalsTableProps {
  summary: MonthSummary;
  payers: PayerRow[];
}

export function TotalsTable({ summary, payers }: TotalsTableProps) {
  const getPayerTotal = (id: string) =>
    summary.totalsByPerson.find(t => t.paid_by === id)?.total || 0;

  return (
    <div className="mb-6 space-y-4">
      {/* Payer Cards */}
      <div className="grid grid-cols-2 gap-4">
        {payers.map(payer => {
          const total = getPayerTotal(payer.id);
          return (
            <Card key={payer.id} className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={payer.display_name} size="md" />
                <span className="font-medium text-[var(--warm-800)]">
                  {payer.display_name}
                </span>
              </div>
              <p className="text-2xl font-bold text-[var(--warm-900)]">
                {formatAmount(total)}
              </p>
              <p className="text-sm text-[var(--warm-500)] mt-1">SEK</p>
            </Card>
          );
        })}
      </div>

      {/* Grand Total */}
      <Card className="p-5 bg-gradient-to-br from-[var(--terracotta-50)] to-[var(--sage-50)]">
        <div className="flex items-center justify-between">
          <span className="text-[var(--warm-600)] font-medium">
            Total this month
          </span>
          <div className="text-right">
            <span className="text-2xl font-bold text-[var(--warm-900)]">
              {formatAmount(summary.grandTotal)}
            </span>
            <span className="text-sm text-[var(--warm-500)] ml-2">SEK</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
