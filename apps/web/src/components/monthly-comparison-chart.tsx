import { useMemo } from "react";
import { Card } from "./ui";
import { formatAmount, getCurrentMonth } from "@expenses/shared";

interface MonthlyComparisonProps {
  data: {
    month: string; // YYYY-MM
    label: string; // "Jan", "Feb"
    total: number; // cents
  }[];
}

export function MonthlyComparisonChart({ data }: MonthlyComparisonProps) {
  const currentMonth = getCurrentMonth();

  // Get max value for scaling
  const maxTotal = useMemo(
    () => Math.max(...data.map((d) => d.total), 1),
    [data]
  );

  // Calculate trend
  const trend = useMemo(() => {
    if (data.length < 2) return null;
    const current = data[data.length - 1]?.total || 0;
    const previous = data[data.length - 2]?.total || 0;
    if (previous === 0) return null;

    const change = Math.round(((current - previous) / previous) * 100);
    return {
      value: Math.abs(change),
      direction: change > 0 ? "up" : change < 0 ? "down" : "flat",
    };
  }, [data]);

  // Get current month total for display
  const currentTotal = data[data.length - 1]?.total || 0;

  if (data.length === 0) {
    return (
      <Card variant="mint" hover>
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-charcoal-text">Total Spending</h2>
            <p className="text-sm text-charcoal-text/60 mt-1">Monthly trend</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12 text-charcoal-text/50">
          <span className="material-symbols-outlined text-4xl mr-3">bar_chart</span>
          <span className="text-lg font-medium">No data available</span>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="mint" hover>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-charcoal-text">Total Spending</h2>
          <p className="text-sm text-charcoal-text/60 mt-1">
            {data.length}-month trend
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-charcoal-text">
            {formatAmount(currentTotal)} kr
          </p>
          {trend && (
            <div className="flex items-center justify-end gap-1 text-xs font-bold text-charcoal-text/50">
              <span
                className={`material-symbols-outlined text-sm font-bold ${
                  trend.direction === "up"
                    ? "text-red-500"
                    : trend.direction === "down"
                      ? "text-green-600"
                      : "text-charcoal-text/50"
                }`}
              >
                {trend.direction === "up"
                  ? "arrow_upward"
                  : trend.direction === "down"
                    ? "arrow_downward"
                    : "remove"}
              </span>
              <span>
                {trend.value}% vs {data[data.length - 2]?.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bar chart */}
      <div className="h-64 w-full flex items-end gap-2 sm:gap-4 pt-4">
        {data.map((item) => {
          const heightPercent = (item.total / maxTotal) * 100;
          const isCurrentMonth = item.month === currentMonth;

          return (
            <div
              key={item.month}
              className="flex-1 flex flex-col items-center gap-3 group h-full justify-end"
            >
              <div
                className={`w-full rounded-t-xl transition-all relative flex items-end justify-center ${
                  isCurrentMonth
                    ? "bg-accent-success/50 hover:bg-accent-success/60 shadow-sm"
                    : "bg-white/40 group-hover:bg-white/60"
                }`}
                style={{ height: `${Math.max(heightPercent, 2)}%` }}
              >
                <span
                  className={`absolute -top-8 text-xs font-bold text-charcoal-text transition-opacity ${
                    isCurrentMonth
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {formatAmount(item.total)}
                </span>
              </div>
              <span
                className={`text-xs font-bold uppercase ${
                  isCurrentMonth ? "text-charcoal-text" : "text-charcoal-text/40"
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
