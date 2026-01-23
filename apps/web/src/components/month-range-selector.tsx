"use client";

import { useState, useRef, useEffect } from "react";

export type RangeOption = "3" | "6" | "12";

interface MonthRangeSelectorProps {
  value: RangeOption;
  onChange: (value: RangeOption) => void;
}

const options: { value: RangeOption; label: string }[] = [
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months" },
];

export function MonthRangeSelector({ value, onChange }: MonthRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full border border-charcoal-text/5 shadow-sm hover:shadow-md transition-all text-charcoal-text"
      >
        <span className="material-symbols-outlined text-charcoal-text/50 text-[20px]">
          date_range
        </span>
        <span className="text-sm font-bold">{selectedOption.label}</span>
        <span className="material-symbols-outlined text-charcoal-text/50 text-[20px]">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg border border-charcoal-text/5 overflow-hidden z-50 min-w-[140px]">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                option.value === value
                  ? "bg-pastel-mint text-charcoal-text font-bold"
                  : "text-charcoal-text/70 hover:bg-cream-bg"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
