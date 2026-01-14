"use client";

import { useState } from "react";
import { formatMonthDisplay, getCurrentMonth } from "@expenses/shared";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "@/components/ui/icons";
import { MonthPicker } from "@/components/month-picker";
import { cn } from "@/lib/utils";

interface MonthNavigatorProps {
  currentMonth: string;
  onPrevious: () => void;
  onNext: () => void;
  onSelectMonth?: (month: string) => void;
}

export function MonthNavigator({
  currentMonth,
  onPrevious,
  onNext,
  onSelectMonth,
}: MonthNavigatorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const isCurrentMonth = currentMonth === getCurrentMonth();

  const handleSelectMonth = (month: string) => {
    onSelectMonth?.(month);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6 bg-white rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <button
          onClick={() => setPickerOpen(true)}
          className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-[var(--radius-pill)]",
            "hover:bg-[var(--warm-100)] active:scale-[0.98] transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
          )}
          aria-label="Open month picker"
        >
          {/* Icon in circle */}
          <div
            className="w-8 h-8 rounded-full bg-[var(--terracotta-100)] flex items-center justify-center"
            data-testid="calendar-icon-circle"
          >
            <Calendar className="h-4 w-4 text-[var(--terracotta-600)]" />
          </div>
          {/* Uppercase month label */}
          <span className="text-sm font-semibold uppercase tracking-wider text-[var(--warm-700)]">
            {formatMonthDisplay(currentMonth).toUpperCase()}
          </span>
        </button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          disabled={isCurrentMonth}
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <MonthPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        selectedMonth={currentMonth}
        onSelectMonth={handleSelectMonth}
      />
    </>
  );
}
