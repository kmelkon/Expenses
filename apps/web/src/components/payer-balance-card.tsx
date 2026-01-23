import { Card } from "./ui";
import { formatAmount } from "@expenses/shared";
import type { PayerBalance } from "@/lib/calculations/spending-calculations";
import { calculateSettlement } from "@/lib/calculations/spending-calculations";

// Payer avatar colors
const avatarColors = [
  "bg-pastel-lavender",
  "bg-accent-warning/50",
  "bg-pastel-mint",
  "bg-pastel-blue",
];

interface PayerBalanceCardProps {
  balances: PayerBalance[];
  monthLabel: string;
}

export function PayerBalanceCard({ balances, monthLabel }: PayerBalanceCardProps) {
  const settlement = calculateSettlement(balances);
  const grandTotal = balances.reduce((sum, b) => sum + b.paid, 0);

  if (balances.length === 0) {
    return (
      <Card variant="blue" hover>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-charcoal-text">Household Split</h3>
        </div>
        <div className="flex items-center justify-center py-12 text-charcoal-text/50">
          <span className="material-symbols-outlined text-4xl mr-3">group</span>
          <span className="text-lg font-medium">No expenses to split</span>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="blue" hover>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-charcoal-text">Household Split</h3>
        <div className="px-3 py-1 bg-white/50 rounded-full text-xs font-bold text-charcoal-text/60">
          {monthLabel}
        </div>
      </div>

      {/* Payer cards */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        {balances.map((payer, index) => {
          const percentage = grandTotal > 0 ? Math.round((payer.paid / grandTotal) * 100) : 0;

          return (
            <div
              key={payer.payerId}
              className="flex-1 bg-white/40 rounded-2xl p-6 flex items-center justify-between group hover:bg-white/60 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-charcoal-text text-lg shadow-sm ${
                    avatarColors[index % avatarColors.length]
                  }`}
                >
                  {payer.payerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal-text/50 uppercase tracking-wide">
                    {payer.payerName}
                  </p>
                  <p className="text-2xl font-black text-charcoal-text">
                    {formatAmount(payer.paid)} kr
                  </p>
                </div>
              </div>
              <span className="text-xl font-bold text-charcoal-text/40 group-hover:text-charcoal-text/60">
                {percentage}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Balance bar */}
      {balances.length === 2 && (
        <div className="mt-8 relative pt-2">
          <div className="w-full h-3 bg-white/40 rounded-full overflow-hidden flex">
            {balances.map((payer, index) => {
              const percentage = grandTotal > 0 ? (payer.paid / grandTotal) * 100 : 50;
              return (
                <div
                  key={payer.payerId}
                  className={`h-full ${index === 0 ? "bg-pastel-lavender" : "bg-accent-warning/60"}`}
                  style={{ width: `${percentage}%` }}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs font-semibold text-charcoal-text/40">
            {balances.map((payer) => {
              const percentage = grandTotal > 0 ? Math.round((payer.paid / grandTotal) * 100) : 50;
              return (
                <span key={payer.payerId}>
                  {payer.payerName} {percentage}%
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Settlement summary */}
      <div className="mt-6 p-4 bg-white/30 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-charcoal-text/50 text-[20px]">
              {settlement ? "swap_horiz" : "check_circle"}
            </span>
            <span className="text-sm font-bold text-charcoal-text">
              {settlement ? "Settlement needed" : "All settled!"}
            </span>
          </div>
          {settlement && (
            <span className="text-sm font-medium text-charcoal-text/70">
              {settlement.from} owes {settlement.to}{" "}
              <span className="font-bold">{formatAmount(settlement.amount)} kr</span>
            </span>
          )}
        </div>

        {/* Balance details */}
        {balances.length > 0 && (
          <div className="mt-4 pt-4 border-t border-charcoal-text/10 grid grid-cols-2 gap-4">
            {balances.map((payer) => (
              <div key={payer.payerId} className="text-xs">
                <p className="text-charcoal-text/50 font-medium mb-1">
                  {payer.payerName}&apos;s balance
                </p>
                <p
                  className={`font-bold ${
                    payer.balance > 0
                      ? "text-green-600"
                      : payer.balance < 0
                        ? "text-red-500"
                        : "text-charcoal-text/50"
                  }`}
                >
                  {payer.balance > 0 ? "+" : ""}
                  {formatAmount(payer.balance)} kr
                </p>
                <p className="text-charcoal-text/40 mt-0.5">
                  Fair share: {formatAmount(payer.share)} kr
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
