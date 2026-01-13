"use client";

import { cn } from "@/lib/utils";

interface LineChartPlaceholderProps {
  title?: string;
  className?: string;
}

export function LineChartPlaceholder({
  title = "Monthly Trends",
  className,
}: LineChartPlaceholderProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="relative w-full h-40">
        {/* SVG Line Chart */}
        <svg
          viewBox="0 0 300 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--sage-400)" />
              <stop offset="50%" stopColor="var(--terracotta-400)" />
              <stop offset="100%" stopColor="var(--sage-400)" />
            </linearGradient>
            <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--terracotta-200)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--terracotta-100)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[25, 50, 75].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="300"
              y2={y}
              stroke="var(--warm-100)"
              strokeWidth="1"
            />
          ))}

          {/* Area fill */}
          <path
            d="M0,70 Q50,55 75,60 T150,45 T225,55 T300,40 L300,100 L0,100 Z"
            fill="url(#area-gradient)"
            className="animate-pulse"
          />

          {/* Wavy line */}
          <path
            d="M0,70 Q50,55 75,60 T150,45 T225,55 T300,40"
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            className="animate-pulse"
          />

          {/* Data points */}
          {[
            { x: 0, y: 70 },
            { x: 75, y: 60 },
            { x: 150, y: 45 },
            { x: 225, y: 55 },
            { x: 300, y: 40 },
          ].map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="white"
              stroke="var(--terracotta-400)"
              strokeWidth="2"
            />
          ))}
        </svg>

        {/* Coming Soon overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-[var(--radius-md)]">
          <span className="text-sm font-medium text-[var(--warm-500)] bg-white/80 px-4 py-2 rounded-full shadow-sm">
            Coming Soon
          </span>
        </div>
      </div>

      {/* Title */}
      {title && (
        <p className="mt-3 text-sm font-medium text-[var(--warm-600)] text-center">
          {title}
        </p>
      )}
    </div>
  );
}
