"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { getCurrentMonth } from "@expenses/shared";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTH_FULL_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface MonthPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMonth: string; // YYYY-MM format
  onSelectMonth: (month: string) => void;
}

export function MonthPicker({
  open,
  onOpenChange,
  selectedMonth,
  onSelectMonth,
}: MonthPickerProps) {
  const [year, month] = selectedMonth.split("-").map(Number);
  const [viewYear, setViewYear] = useState(year);
  const currentMonth = getCurrentMonth();
  const [currentYear, currentMonthNum] = currentMonth.split("-").map(Number);

  const handlePrevYear = () => setViewYear((y) => y - 1);
  const handleNextYear = () => setViewYear((y) => y + 1);

  const handleSelectMonth = (monthIndex: number) => {
    const newMonth = `${viewYear}-${String(monthIndex + 1).padStart(2, "0")}`;
    onSelectMonth(newMonth);
    onOpenChange(false);
  };

  const isMonthDisabled = (monthIndex: number) => {
    // Disable future months
    if (viewYear > currentYear) return true;
    if (viewYear === currentYear && monthIndex + 1 > currentMonthNum) return true;
    return false;
  };

  const isMonthSelected = (monthIndex: number) => {
    return viewYear === year && monthIndex + 1 === month;
  };

  const isCurrentMonth = (monthIndex: number) => {
    return viewYear === currentYear && monthIndex + 1 === currentMonthNum;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Select Month</DialogTitle>
        </DialogHeader>

        {/* Year navigation */}
        <div className="flex items-center justify-between px-2 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevYear}
            aria-label="Previous year"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold text-[var(--warm-900)]">
            {viewYear}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextYear}
            disabled={viewYear >= currentYear}
            aria-label="Next year"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* 4x3 month grid */}
        <div className="grid grid-cols-4 gap-2 p-2">
          {MONTHS.map((monthName, index) => {
            const disabled = isMonthDisabled(index);
            const selected = isMonthSelected(index);
            const current = isCurrentMonth(index);

            return (
              <button
                key={monthName}
                onClick={() => handleSelectMonth(index)}
                disabled={disabled}
                className={cn(
                  "py-3 px-2 rounded-[var(--radius-md)] text-sm font-medium transition-all",
                  "hover:bg-[var(--warm-100)] active:scale-[0.96]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]",
                  "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:active:scale-100",
                  selected &&
                    "bg-[var(--terracotta-500)] text-white hover:bg-[var(--terracotta-600)]",
                  !selected &&
                    current &&
                    "ring-2 ring-[var(--terracotta-300)] bg-[var(--terracotta-50)]",
                  !selected && !current && "text-[var(--warm-700)]"
                )}
                aria-label={`${MONTH_FULL_NAMES[index]} ${viewYear}`}
              >
                {monthName}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
