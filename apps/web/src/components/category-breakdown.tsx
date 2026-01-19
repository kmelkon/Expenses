import { Card } from "./ui";

interface CategoryItem {
  name: string;
  percentage: number;
  color: string;
}

// Placeholder data - will be replaced with real data later
const placeholderCategories: CategoryItem[] = [
  { name: "Groceries", percentage: 40, color: "bg-accent-primary" },
  { name: "Rent", percentage: 25, color: "bg-accent-success" },
  { name: "Dining", percentage: 20, color: "bg-accent-warning" },
  { name: "Utilities", percentage: 15, color: "bg-pastel-lavender" },
];

export function CategoryBreakdown() {
  const topCategory = placeholderCategories[0];

  // Build conic gradient from percentages
  let accumulated = 0;
  const gradientStops = placeholderCategories
    .map((cat) => {
      const start = accumulated;
      accumulated += cat.percentage;
      const colorMap: Record<string, string> = {
        "bg-accent-primary": "#7FB3D5",
        "bg-accent-success": "#8FC99C",
        "bg-accent-warning": "#F7DC6F",
        "bg-pastel-lavender": "#E8DAEF",
      };
      return `${colorMap[cat.color]} ${start}% ${accumulated}%`;
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
          {placeholderCategories.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center gap-3 p-3 bg-white/40 rounded-xl"
            >
              <div className={`w-3 h-3 rounded-full ${cat.color}`} />
              <div className="flex flex-col w-full">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-charcoal-text font-bold">
                    {cat.name}
                  </span>
                  <span className="text-charcoal-text/60 font-semibold">
                    {cat.percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.color}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
