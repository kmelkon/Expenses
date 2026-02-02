import { Card } from "./ui";
import { formatAmount } from "@expenses/shared";
import type { CategoryBreakdownItem } from "@/lib/calculations/spending-calculations";

// Map Tailwind bg classes and short IDs to hex colors for SVG
const colorMap: Record<string, string> = {
  // Tailwind classes (fallback palette)
  "bg-accent-primary": "#7FB3D5",
  "bg-accent-success": "#8FC99C",
  "bg-accent-warning": "#F7DC6F",
  "bg-pastel-lavender": "#E8DAEF",
  "bg-pastel-blue": "#D6EAF8",
  "bg-pastel-mint": "#DDF2D8",
  "bg-pastel-peach": "#FAE5D3",
  // Short IDs (from category settings)
  mint: "#DDF2D8",
  blue: "#D6EAF8",
  peach: "#FAE5D3",
  lavender: "#E8DAEF",
  yellow: "#F7DC6F",
  grey: "#E5E7EB",
};

interface CategoryBreakdownProps {
  breakdown: CategoryBreakdownItem[];
}

export function CategoryBreakdown({ breakdown }: CategoryBreakdownProps) {
  // Handle empty state
  if (breakdown.length === 0) {
    return (
      <Card variant="peach" hover>
        <h3 className="text-xl font-bold text-charcoal-text mb-8">
          Where it went
        </h3>
        <div className="flex items-center justify-center py-12 text-charcoal-text/50">
          <span className="material-symbols-outlined text-4xl mr-3">
            category
          </span>
          <span className="text-lg font-medium">No expenses this month</span>
        </div>
      </Card>
    );
  }

  const topCategory = breakdown[0];

  // Build conic gradient from percentages
  let accumulated = 0;
  const gradientStops = breakdown
    .map((cat) => {
      const start = accumulated;
      accumulated += cat.percentage;
      const hexColor = colorMap[cat.color] || "#7FB3D5";
      return `${hexColor} ${start}% ${accumulated}%`;
    })
    .join(", ");

  return (
    <Card variant="peach" hover>
      <h3 className="text-xl font-bold text-charcoal-text mb-8">
        Where it went
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-10">
        {/* Donut chart */}
        <div className="relative w-48 h-48 shrink-0">
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `conic-gradient(${gradientStops})`,
              transform: "rotate(-90deg)",
            }}
          />
          <div className="absolute inset-0 m-auto w-32 h-32 bg-cream-bg rounded-full flex items-center justify-center flex-col shadow-sm">
            <span className="text-light-grey-text text-xs font-bold uppercase tracking-wide">
              Top
            </span>
            <span className="text-charcoal-text font-black text-xl">
              {topCategory.name}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 w-full">
          {breakdown.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center gap-3 p-3 bg-white/40 rounded-xl"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: colorMap[cat.color] || "#7FB3D5" }}
              />
              <div className="flex flex-col w-full min-w-0">
                <div className="flex justify-between text-sm mb-1 gap-2">
                  <span className="text-charcoal-text font-bold truncate">
                    {cat.name}
                  </span>
                  <span className="text-charcoal-text/80 font-semibold whitespace-nowrap">
                    {formatAmount(cat.amount)} kr
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: colorMap[cat.color] || "#7FB3D5",
                      }}
                    />
                  </div>
                  <span className="text-xs text-charcoal-text/50 font-semibold w-8 text-right">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
