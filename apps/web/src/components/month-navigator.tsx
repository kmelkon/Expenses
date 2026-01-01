"use client";

import { formatMonthDisplay, getCurrentMonth } from "@expenses/shared";

interface MonthNavigatorProps {
  currentMonth: string;
  onPrevious: () => void;
  onNext: () => void;
}

export function MonthNavigator({ currentMonth, onPrevious, onNext }: MonthNavigatorProps) {
  const isCurrentMonth = currentMonth === getCurrentMonth();

  return (
    <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
      <button
        onClick={onPrevious}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Previous month"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h2 className="text-lg font-semibold text-gray-900">
        {formatMonthDisplay(currentMonth)}
      </h2>
      <button
        onClick={onNext}
        disabled={isCurrentMonth}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next month"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
