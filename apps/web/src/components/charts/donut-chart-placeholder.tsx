"use client";

import { cn } from "@/lib/utils";

interface DonutChartPlaceholderProps {
  title?: string;
  className?: string;
}

export function DonutChartPlaceholder({
  title = "Category Breakdown",
  className,
}: DonutChartPlaceholderProps) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative w-48 h-48">
        {/* SVG Donut */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full -rotate-90"
        >
          <defs>
            <linearGradient id="donut-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--terracotta-300)" />
              <stop offset="50%" stopColor="var(--sage-300)" />
              <stop offset="100%" stopColor="var(--terracotta-200)" />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="var(--warm-100)"
            strokeWidth="12"
          />
          {/* Animated gradient arc */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#donut-gradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="188 63"
            className="animate-pulse"
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-medium text-[var(--warm-500)]">
            Coming
          </span>
          <span className="text-sm font-medium text-[var(--warm-500)]">
            Soon
          </span>
        </div>
      </div>

      {/* Title */}
      {title && (
        <p className="mt-4 text-sm font-medium text-[var(--warm-600)]">
          {title}
        </p>
      )}
    </div>
  );
}
