import { Card } from "./ui";
import type { MonthSummary, PayerRow } from "@expenses/shared";
import { formatSEKParts } from "@expenses/shared";

interface SummaryCardProps {
  summary: MonthSummary;
  payers: PayerRow[];
  monthName: string;
}

// Assign colors to payers based on index
const payerColors = ["lavender", "warning", "mint", "blue"] as const;

export function SummaryCard({ summary, payers, monthName }: SummaryCardProps) {
  const { kronor, ore } = formatSEKParts(summary.grandTotal);

  return (
    <Card variant="mint" hover className="relative">
      {/* Decorative blur */}
      <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
        {/* Main total */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-white/40 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-sm text-charcoal-text/70">
                calendar_today
              </span>
            </span>
            <span className="text-sm font-bold uppercase tracking-wider text-charcoal-text/60">
              {monthName} Spending
            </span>
          </div>
          <h2 className="text-5xl font-black text-charcoal-text tracking-tight">
            {kronor}
            <span className="text-2xl text-charcoal-text/50 font-medium">
              .{ore}
            </span>
          </h2>
          {/* Trend indicator - placeholder */}
          <div className="mt-2 flex items-center gap-2">
            <span className="bg-white/50 px-3 py-1 rounded-full text-xs font-bold text-charcoal-text flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                trending_up
              </span>
              -
            </span>
            <span className="text-xs text-charcoal-text/60 font-medium">
              vs last month
            </span>
          </div>
        </div>

        {/* Per-person breakdown */}
        <div className="bg-white/50 rounded-2xl p-4 backdrop-blur-sm flex items-center gap-6 w-full md:w-auto shadow-sm border border-white/40">
          {payers.map((payer, index) => {
            const payerTotal =
              summary.totalsByPerson.find((t) => t.paid_by === payer.id)
                ?.total || 0;
            const { kronor: payerKronor, ore: payerOre } = formatSEKParts(payerTotal);
            const colorClass =
              payerColors[index % payerColors.length] === "lavender"
                ? "bg-pastel-lavender"
                : payerColors[index % payerColors.length] === "warning"
                  ? "bg-accent-warning"
                  : payerColors[index % payerColors.length] === "mint"
                    ? "bg-pastel-mint"
                    : "bg-pastel-blue";

            return (
              <div key={payer.id} className="flex items-center gap-6">
                {index > 0 && (
                  <div className="w-px h-10 bg-charcoal-text/10" />
                )}
                <div className="flex flex-col min-w-[90px]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${colorClass} ring-1 ring-charcoal-text/10`}
                    />
                    <p className="text-[10px] font-bold text-charcoal-text/60 uppercase tracking-wide">
                      {payer.display_name} Spent
                    </p>
                  </div>
                  <p className="text-xl font-bold text-charcoal-text tracking-tight">
                    {payerKronor}
                    <span className="text-sm text-charcoal-text/50">
                      .{payerOre}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
