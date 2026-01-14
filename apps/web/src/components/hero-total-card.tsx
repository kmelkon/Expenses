"use client";

import type { MonthSummary, PayerRow } from "@expenses/shared";
import {
  splitAmount,
  formatAmount,
  calculateTrendPercentage,
} from "@expenses/shared";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface HeroTotalCardProps {
  summary: MonthSummary;
  previousMonthTotal?: number;
  payers: PayerRow[];
}

export function HeroTotalCard({
  summary,
  previousMonthTotal,
  payers,
}: HeroTotalCardProps) {
  const { main, decimal } = splitAmount(summary.grandTotal);
  const trend =
    previousMonthTotal !== undefined
      ? calculateTrendPercentage(summary.grandTotal, previousMonthTotal)
      : null;

  const getPayerTotal = (id: string) =>
    summary.totalsByPerson.find((t) => t.paid_by === id)?.total || 0;

  return (
    <Card
      variant="mint"
      className="p-6 mb-6"
      data-testid="hero-total-card"
    >
      {/* Main Total */}
      <div className="text-center mb-4">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold text-[var(--warm-900)]">
            {main}
          </span>
          <span className="text-2xl font-medium text-[var(--warm-500)]">
            ,{decimal}
          </span>
        </div>
        <p className="text-sm text-[var(--warm-600)] mt-1">Total this month</p>
      </div>

      {/* Trend Pill */}
      {trend && trend.direction !== "neutral" && (
        <div className="flex justify-center mb-4">
          <div
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
              trend.direction === "up"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            )}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="h-4 w-4" data-testid="trend-up" />
            ) : (
              <TrendingDown className="h-4 w-4" data-testid="trend-down" />
            )}
            {trend.percentage}% vs last month
          </div>
        </div>
      )}

      {/* Per-Payer Breakdown */}
      <div className="flex justify-center gap-8 pt-4 border-t border-[var(--warm-200)]">
        {payers.map((payer) => (
          <div key={payer.id} className="text-center">
            <p className="text-lg font-semibold text-[var(--warm-800)]">
              {formatAmount(getPayerTotal(payer.id))}
            </p>
            <p className="text-xs text-[var(--warm-500)]">
              {payer.display_name}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
