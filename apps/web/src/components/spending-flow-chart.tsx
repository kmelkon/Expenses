import { useMemo } from "react";
import { Card } from "./ui";
import type { ExpenseRow } from "@expenses/shared";
import { formatAmount } from "@expenses/shared";
import { calculateCumulativeSpending } from "@/lib/calculations/spending-calculations";

interface SpendingFlowChartProps {
  expenses: ExpenseRow[];
  month: string; // YYYY-MM
}

export function SpendingFlowChart({ expenses, month }: SpendingFlowChartProps) {
  const cumulativeData = useMemo(
    () => calculateCumulativeSpending(expenses, month),
    [expenses, month]
  );

  // Get max value for Y-axis scaling
  const maxCumulative = Math.max(...cumulativeData.map((d) => d.cumulative), 1);

  // SVG dimensions
  const width = 478;
  const height = 150;
  const padding = { top: 10, right: 10, bottom: 0, left: 0 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Generate SVG path from data points
  const pathData = useMemo(() => {
    if (cumulativeData.length === 0) return "";

    const points = cumulativeData.map((d, i) => {
      const x = padding.left + (i / (cumulativeData.length - 1)) * chartWidth;
      const y =
        padding.top + chartHeight - (d.cumulative / maxCumulative) * chartHeight;
      return { x, y };
    });

    // Generate smooth curve using line segments
    return points.map((p, i) => (i === 0 ? `M${p.x} ${p.y}` : `L${p.x} ${p.y}`)).join(" ");
  }, [cumulativeData, maxCumulative, chartWidth, chartHeight]);

  // Generate area path (for gradient fill)
  const areaPath = useMemo(() => {
    if (!pathData) return "";
    return `${pathData} L${width - padding.right} ${height} L${padding.left} ${height} Z`;
  }, [pathData]);

  // Generate x-axis labels (5 evenly spaced dates)
  const xAxisLabels = useMemo(() => {
    if (cumulativeData.length === 0) return [];

    const indices = [0, 7, 14, 21, cumulativeData.length - 1].filter(
      (i) => i < cumulativeData.length
    );

    return indices.map((i) => {
      const date = cumulativeData[i].date;
      const [, monthNum, day] = date.split("-");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${monthNames[parseInt(monthNum) - 1]} ${parseInt(day)}`;
    });
  }, [cumulativeData]);

  // Get current total for display
  const currentTotal = cumulativeData[cumulativeData.length - 1]?.cumulative || 0;
  const hasExpenses = expenses.length > 0;

  return (
    <Card variant="blue" hover>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-charcoal-text">Spending Flow</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-charcoal-text/60">
            {formatAmount(currentTotal)} kr
          </span>
        </div>
      </div>

      {/* Empty state */}
      {!hasExpenses && (
        <div className="flex items-center justify-center py-12 text-charcoal-text/50">
          <span className="material-symbols-outlined text-4xl mr-3">
            show_chart
          </span>
          <span className="text-lg font-medium">No expenses this month</span>
        </div>
      )}

      {/* Chart SVG */}
      {hasExpenses && (
      <>
      <div className="w-full h-48">
        <svg
          className="w-full h-full overflow-visible"
          fill="none"
          preserveAspectRatio="none"
          viewBox={`0 0 ${width} ${height}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              id="paint0_linear_pastel"
              x1={width / 2}
              x2={width / 2}
              y1="1"
              y2={height - 1}
            >
              <stop stopColor="#7FB3D5" stopOpacity="0.2" />
              <stop offset="1" stopColor="#7FB3D5" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            stroke="#ffffff"
            strokeDasharray="6 6"
            strokeOpacity="0.6"
            strokeWidth="2"
            x1="0"
            x2={width}
            y1={height - 1}
            y2={height - 1}
          />
          <line
            stroke="#ffffff"
            strokeDasharray="6 6"
            strokeOpacity="0.6"
            strokeWidth="2"
            x1="0"
            x2={width}
            y1={height / 2}
            y2={height / 2}
          />

          {/* Area fill */}
          {areaPath && <path d={areaPath} fill="url(#paint0_linear_pastel)" />}

          {/* Line */}
          {pathData && (
            <path
              d={pathData}
              stroke="#7FB3D5"
              strokeLinecap="round"
              strokeWidth="4"
              fill="none"
            />
          )}
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between px-2 mt-4">
        {xAxisLabels.map((label, i) => (
          <p key={i} className="text-charcoal-text/50 text-xs font-semibold">
            {label}
          </p>
        ))}
      </div>
      </>
      )}
    </Card>
  );
}
