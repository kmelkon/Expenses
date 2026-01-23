"use client";

import { useMemo, useState } from "react";
import { Card } from "./ui";
import { formatAmount } from "@expenses/shared";

// Map Tailwind bg classes to hex colors for SVG
const colorMap: Record<string, string> = {
  "bg-accent-primary": "#7FB3D5",
  "bg-accent-success": "#8FC99C",
  "bg-accent-warning": "#F7DC6F",
  "bg-pastel-lavender": "#E8DAEF",
  "bg-pastel-blue": "#D6EAF8",
  "bg-pastel-mint": "#DDF2D8",
  "bg-pastel-peach": "#FAE5D3",
};

interface CategoryTrendsProps {
  data: {
    month: string;
    label: string;
    categories: {
      name: string;
      total: number;
      color: string;
    }[];
  }[];
}

export function CategoryTrendsChart({ data }: CategoryTrendsProps) {
  // Get unique categories
  const allCategories = useMemo(() => {
    const categorySet = new Set<string>();
    data.forEach((d) => d.categories.forEach((c) => categorySet.add(c.name)));
    return Array.from(categorySet);
  }, [data]);

  // Track which categories are visible
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(
    () => new Set(allCategories.slice(0, 4)) // Show top 4 by default
  );

  // Get max value for Y-axis scaling
  const maxValue = useMemo(() => {
    let max = 0;
    data.forEach((d) => {
      d.categories.forEach((c) => {
        if (visibleCategories.has(c.name) && c.total > max) {
          max = c.total;
        }
      });
    });
    return max || 1;
  }, [data, visibleCategories]);

  // SVG dimensions
  const width = 478;
  const height = 200;
  const padding = { top: 20, right: 10, bottom: 30, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Generate line paths for each category
  const linePaths = useMemo(() => {
    const paths: { name: string; color: string; d: string }[] = [];

    allCategories.forEach((categoryName) => {
      if (!visibleCategories.has(categoryName)) return;

      const points = data.map((monthData, i) => {
        const category = monthData.categories.find((c) => c.name === categoryName);
        const total = category?.total || 0;
        const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth;
        const y = padding.top + chartHeight - (total / maxValue) * chartHeight;
        return { x, y, total };
      });

      const colorClass = data[0]?.categories.find((c) => c.name === categoryName)?.color || "bg-accent-primary";
      const hexColor = colorMap[colorClass] || colorClass;

      const d = points.map((p, i) => (i === 0 ? `M${p.x} ${p.y}` : `L${p.x} ${p.y}`)).join(" ");

      paths.push({ name: categoryName, color: hexColor, d });
    });

    return paths;
  }, [data, allCategories, visibleCategories, maxValue, chartWidth, chartHeight]);

  const toggleCategory = (name: string) => {
    setVisibleCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  if (data.length === 0) {
    return (
      <Card variant="peach" hover>
        <h3 className="text-xl font-bold text-charcoal-text mb-4">Category Trends</h3>
        <div className="flex items-center justify-center py-12 text-charcoal-text/50">
          <span className="material-symbols-outlined text-4xl mr-3">show_chart</span>
          <span className="text-lg font-medium">No data available</span>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="peach" hover>
      <h3 className="text-xl font-bold text-charcoal-text mb-2">Category Trends</h3>
      <p className="text-sm text-charcoal-text/60 mb-6">
        Spending by category over time
      </p>

      {/* Legend - toggleable */}
      <div className="flex flex-wrap gap-2 mb-6">
        {allCategories.map((name) => {
          const colorClass = data[0]?.categories.find((c) => c.name === name)?.color || "bg-accent-primary";
          const hexColor = colorMap[colorClass] || colorClass;
          const isVisible = visibleCategories.has(name);

          return (
            <button
              key={name}
              onClick={() => toggleCategory(name)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isVisible
                  ? "bg-white/60 text-charcoal-text shadow-sm"
                  : "bg-white/20 text-charcoal-text/40"
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: hexColor,
                  opacity: isVisible ? 1 : 0.3,
                }}
              />
              {name}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="w-full h-52">
        <svg
          className="w-full h-full overflow-visible"
          fill="none"
          preserveAspectRatio="none"
          viewBox={`0 0 ${width} ${height}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid lines */}
          <line
            stroke="#ffffff"
            strokeDasharray="4 4"
            strokeOpacity="0.5"
            strokeWidth="1"
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + chartHeight}
            y2={padding.top + chartHeight}
          />
          <line
            stroke="#ffffff"
            strokeDasharray="4 4"
            strokeOpacity="0.5"
            strokeWidth="1"
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + chartHeight / 2}
            y2={padding.top + chartHeight / 2}
          />

          {/* Lines for each category */}
          {linePaths.map((path) => (
            <path
              key={path.name}
              d={path.d}
              stroke={path.color}
              strokeLinecap="round"
              strokeWidth="3"
              fill="none"
            />
          ))}

          {/* X-axis labels */}
          {data.map((d, i) => {
            const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartWidth;
            return (
              <text
                key={d.month}
                x={x}
                y={height - 5}
                textAnchor="middle"
                className="text-[10px] font-bold fill-charcoal-text/40"
              >
                {d.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Y-axis range indicator */}
      <div className="flex justify-between text-[10px] text-charcoal-text/40 font-medium mt-2">
        <span>0 kr</span>
        <span>{formatAmount(maxValue)} kr</span>
      </div>
    </Card>
  );
}
