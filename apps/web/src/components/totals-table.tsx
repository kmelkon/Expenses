"use client";

import type { MonthSummary, PayerRow } from "@expenses/shared";
import { formatAmount } from "@expenses/shared";

interface TotalsTableProps {
  summary: MonthSummary;
  payers: PayerRow[];
}

/**
 * Render a monthly summary card showing each payer's total and the grand total.
 *
 * @param summary - Month summary containing per-person totals and the grand total
 * @param payers - Array of payers used to resolve display names for each total
 * @returns The rendered totals table element
 */
export function TotalsTable({ summary, payers }: TotalsTableProps) {
  const getPayerName = (id: string) =>
    payers.find(p => p.id === id)?.display_name || id;

  const getPayerTotal = (id: string) =>
    summary.totalsByPerson.find(t => t.paid_by === id)?.total || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-500 mb-3">Monthly Summary</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {payers.map(payer => (
          <div key={payer.id} className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">{payer.display_name}</p>
            <p className="text-xl font-semibold text-gray-900">
              {formatAmount(getPayerTotal(payer.id))}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t pt-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total</span>
          <span className="text-lg font-bold text-gray-900">
            {formatAmount(summary.grandTotal)} SEK
          </span>
        </div>
      </div>
    </div>
  );
}