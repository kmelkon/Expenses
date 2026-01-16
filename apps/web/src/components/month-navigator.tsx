"use client";

import { formatMonthDisplay, getCurrentMonth } from "@expenses/shared";

interface MonthNavigatorProps {
  currentMonth: string;
  onPrevious: () => void;
  onNext: () => void;
}

export function MonthNavigator({
  currentMonth,
  onPrevious,
  onNext,
}: MonthNavigatorProps) {
  const isCurrentMonth = currentMonth === getCurrentMonth();

  return (
    <div className="flex items-center justify-between mb-6 bg-white/50 rounded-2xl border border-white/50 shadow-sm p-4">
      <button
        onClick={onPrevious}
        className="p-2 hover:bg-white rounded-xl transition-colors"
        aria-label="Previous month"
      >
        <span className="material-symbols-outlined text-charcoal-text">
          chevron_left
        </span>
      </button>
      <h2 className="text-lg font-bold text-charcoal-text">
        {formatMonthDisplay(currentMonth)}
      </h2>
      <button
        onClick={onNext}
        disabled={isCurrentMonth}
        className="p-2 hover:bg-white rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next month"
      >
        <span className="material-symbols-outlined text-charcoal-text">
          chevron_right
        </span>
      </button>
    </div>
  );
}
