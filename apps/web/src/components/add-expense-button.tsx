"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CategoryRow, PayerRow } from "@expenses/shared";
import { parseAmountInput, getTodayYYYYMMDD } from "@expenses/shared";

// Color mappings for categories
const CATEGORY_COLORS: Record<string, { bg: string }> = {
  mint: { bg: "bg-pastel-mint" },
  blue: { bg: "bg-pastel-blue" },
  peach: { bg: "bg-pastel-peach" },
  lavender: { bg: "bg-pastel-lavender" },
  yellow: { bg: "bg-accent-warning/50" },
  grey: { bg: "bg-gray-200" },
};

function getCategoryColor(colorId: string | undefined) {
  return CATEGORY_COLORS[colorId || "mint"] || CATEGORY_COLORS.mint;
}

interface AddExpenseButtonProps {
  categories: CategoryRow[];
  payers: PayerRow[];
  householdId: string;
  onAdded: () => void;
  forceOpen?: boolean;
  onClose?: () => void;
  hideButton?: boolean;
}

export function AddExpenseButton({
  categories,
  payers,
  householdId,
  onAdded,
  forceOpen,
  onClose,
  hideButton,
}: AddExpenseButtonProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use forceOpen if provided, otherwise use internal state
  const isOpen = forceOpen !== undefined ? forceOpen : internalOpen;

  const handleOpen = () => {
    if (forceOpen === undefined) {
      setInternalOpen(true);
    }
  };

  const handleClose = () => {
    if (forceOpen === undefined) {
      setInternalOpen(false);
    }
    setError(null);
    onClose?.();
  };

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]?.name || "");
  const [paidBy, setPaidBy] = useState(payers[0]?.id || "");
  const [date, setDate] = useState(getTodayYYYYMMDD());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountCents = parseAmountInput(amount);
    if (!amountCents) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { error: insertError } = await supabase.from("expenses").insert({
        id,
        household_id: householdId,
        amount_cents: amountCents,
        paid_by: paidBy,
        date,
        note: note || null,
        category,
      });

      if (insertError) {
        setError(insertError.message || "Failed to add expense");
        setLoading(false);
        return;
      }

      setAmount("");
      setNote("");
      setDate(getTodayYYYYMMDD());
      setError(null);
      handleClose();
      setLoading(false);
      onAdded();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setLoading(false);
    }
  };

  return (
    <>
      {!hideButton && (
        <button
          onClick={handleOpen}
          className="group flex items-center gap-2 bg-charcoal-text text-cream-bg px-5 py-2.5 rounded-full hover:bg-charcoal-text/80 transition-all shadow-lg shadow-charcoal-text/20"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">
            add
          </span>
          <span className="font-semibold text-sm">Add New</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-charcoal-text/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="relative bg-white w-full sm:max-w-xl sm:rounded-[2rem] rounded-t-[2rem] overflow-hidden shadow-2xl max-h-[95vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 hover:bg-white/50 rounded-full transition-colors sm:hidden"
            >
              <span className="material-symbols-outlined text-charcoal-text/60">
                close
              </span>
            </button>

            <form onSubmit={handleSubmit}>
              {/* Amount Header Section */}
              <div className="bg-pastel-mint/30 p-8 sm:p-10 flex flex-col items-center justify-center border-b border-pastel-mint/20">
                <label
                  className="text-xs font-bold uppercase tracking-widest text-charcoal-text/40 mb-3"
                  htmlFor="amount"
                >
                  Amount
                </label>
                <div className="relative flex items-center justify-center w-full">
                  <input
                    autoFocus
                    className="w-full bg-transparent border-none p-0 text-5xl sm:text-6xl font-black text-charcoal-text text-center focus:ring-0 placeholder:text-charcoal-text/10 leading-none"
                    id="amount"
                    placeholder="0.00"
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      // Only allow digits and one decimal point
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setAmount(value);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col divide-y divide-gray-100">
                {/* Merchant/Note Input */}
                <div className="w-full p-5 sm:p-6 hover:bg-gray-50/50 transition-colors">
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-grey-text mb-2">
                    Merchant
                  </label>
                  <input
                    className="w-full bg-transparent border-none p-0 text-lg font-bold text-charcoal-text placeholder:text-charcoal-text/20 focus:ring-0"
                    placeholder="e.g. Whole Foods"
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>

                {/* Category Picker */}
                <div className="w-full p-5 sm:p-6 bg-white">
                  <label className="block text-xs font-bold uppercase tracking-wider text-light-grey-text mb-4">
                    Category
                  </label>
                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {categories.map((cat) => {
                      const colorClass = getCategoryColor(cat.color);
                      const isSelected = category === cat.name;
                      return (
                        <label
                          key={cat.id}
                          className="cursor-pointer group flex flex-col items-center gap-2"
                        >
                          <input
                            className="peer sr-only"
                            name="category"
                            type="radio"
                            value={cat.name}
                            checked={isSelected}
                            onChange={(e) => setCategory(e.target.value)}
                          />
                          <div
                            className={`h-11 w-11 sm:h-12 sm:w-12 rounded-full ${colorClass.bg} flex items-center justify-center text-charcoal-text/60 peer-checked:text-charcoal-text peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-charcoal-text/20 transition-all group-hover:scale-110`}
                          >
                            <span className="material-symbols-outlined text-xl sm:text-[24px]">
                              {cat.icon || "label"}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-light-grey-text peer-checked:text-charcoal-text transition-colors text-center leading-tight truncate w-full">
                            {cat.name}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Date and Paid By Row */}
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6">
                  {/* Date Picker */}
                  <div className="w-full sm:w-auto">
                    <label className="block text-xs font-bold uppercase tracking-wider text-light-grey-text mb-2">
                      Date
                    </label>
                    <input
                      className="bg-transparent border-none p-0 text-lg font-bold text-charcoal-text focus:ring-0 w-full font-sans text-left"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  {/* Paid By Toggle */}
                  <div className="w-full sm:w-auto flex flex-col items-start sm:items-end gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-light-grey-text">
                      Paid by
                    </span>
                    <div className="flex bg-cream-bg p-1.5 rounded-xl gap-1">
                      {payers.map((payer, index) => (
                        <label key={payer.id} className="cursor-pointer">
                          <input
                            className="peer sr-only"
                            name="paid_by"
                            type="radio"
                            value={payer.id}
                            checked={paidBy === payer.id}
                            onChange={(e) => setPaidBy(e.target.value)}
                          />
                          <div
                            className={`px-5 sm:px-6 py-2 rounded-lg text-sm font-bold text-charcoal-text/50 peer-checked:text-charcoal-text peer-checked:shadow-sm transition-all flex items-center gap-2 ${
                              index === 0
                                ? "peer-checked:bg-pastel-blue"
                                : "peer-checked:bg-accent-warning"
                            }`}
                          >
                            {payer.display_name}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mx-5 sm:mx-6 mb-4 p-3 bg-pastel-peach/50 border border-pastel-peach rounded-xl text-charcoal-text text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="p-5 sm:p-6 pt-0">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-charcoal-text text-cream-bg py-4 rounded-full font-bold text-lg hover:bg-charcoal-text/90 transition-all shadow-xl shadow-charcoal-text/10 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">
                    add
                  </span>
                  {loading ? "Adding..." : "Log Expense"}
                </button>

                {/* Cancel Link */}
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-sm font-bold text-charcoal-text/40 hover:text-charcoal-text transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
