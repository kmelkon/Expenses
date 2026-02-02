"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { getCurrentMonth, getPreviousMonth, formatMonthDisplay } from "@expenses/shared";

interface MonthPickerPopoverProps {
  currentMonth: string; // YYYY-MM
  onSelectMonth: (month: string) => void;
  trigger: ReactNode;
  align?: "left" | "right" | "center";
}

function generateLast12Months(): string[] {
  const months: string[] = [];
  let month = getCurrentMonth();
  for (let i = 0; i < 12; i++) {
    months.push(month);
    month = getPreviousMonth(month);
  }
  return months;
}

export function MonthPickerPopover({
  currentMonth,
  onSelectMonth,
  trigger,
  align = "left",
}: MonthPickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const months = generateLast12Months();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const alignmentClass =
    align === "left"
      ? "left-0"
      : align === "right"
        ? "right-0"
        : "left-1/2 -translate-x-1/2";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 hover:bg-white/30 rounded-lg transition-colors cursor-pointer group"
      >
        {trigger}
        <span className="material-symbols-outlined text-charcoal-text/40 text-[16px] group-hover:text-charcoal-text/60 transition-colors">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isOpen && (
        <div
          className={`absolute ${alignmentClass} mt-2 bg-white rounded-xl shadow-lg border border-charcoal-text/5 overflow-hidden z-50 min-w-[180px] max-h-[320px] overflow-y-auto`}
        >
          {months.map((month) => (
            <button
              key={month}
              onClick={() => {
                onSelectMonth(month);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                month === currentMonth
                  ? "bg-pastel-mint text-charcoal-text font-bold"
                  : "text-charcoal-text/70 hover:bg-cream-bg"
              }`}
            >
              {formatMonthDisplay(month)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
