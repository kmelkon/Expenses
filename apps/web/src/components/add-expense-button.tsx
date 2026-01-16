"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CategoryRow, PayerRow } from "@expenses/shared";
import { parseAmountInput, getTodayYYYYMMDD } from "@expenses/shared";
import { Input, Select, Label } from "@/components/ui";

interface AddExpenseButtonProps {
  categories: CategoryRow[];
  payers: PayerRow[];
  householdId: string;
  onAdded: () => void;
  forceOpen?: boolean;
  onClose?: () => void;
  variant?: "fab" | "inline";
}

export function AddExpenseButton({ categories, payers, householdId, onAdded, forceOpen, onClose, variant = "fab" }: AddExpenseButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Sync with forceOpen prop
  useEffect(() => {
    if (forceOpen !== undefined) {
      setIsOpen(forceOpen);
    }
  }, [forceOpen]);

  const handleClose = () => {
    setIsOpen(false);
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
      alert("Please enter a valid amount");
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
      setIsOpen(false);
      setLoading(false);
      onClose?.();
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <>
      {variant === "fab" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-charcoal-text text-cream-bg rounded-full shadow-lg shadow-charcoal-text/20 hover:bg-charcoal-text/80 transition-colors flex items-center justify-center"
          aria-label="Add expense"
        >
          <span className="material-symbols-outlined text-2xl">add</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 bg-charcoal-text text-cream-bg px-5 py-2.5 rounded-full hover:bg-charcoal-text/80 transition-all shadow-lg shadow-charcoal-text/20"
        >
          <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">
            add
          </span>
          <span className="font-semibold text-sm">Add New</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-charcoal-text/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-charcoal-text">Add Expense</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-cream-bg rounded-xl transition-colors"
              >
                <span className="material-symbols-outlined text-charcoal-text">close</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-pastel-peach/50 border border-pastel-peach rounded-xl text-charcoal-text text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (SEK)</Label>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>Paid by</Label>
                <div className="flex gap-2">
                  {payers.map(payer => (
                    <button
                      key={payer.id}
                      type="button"
                      onClick={() => setPaidBy(payer.id)}
                      className={`flex-1 py-2 px-4 rounded-xl border transition-colors ${
                        paidBy === payer.id
                          ? "bg-charcoal-text text-cream-bg border-charcoal-text"
                          : "bg-white text-charcoal-text border-charcoal-text/10 hover:bg-cream-bg"
                      }`}
                    >
                      {payer.display_name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="note">Note (optional)</Label>
                <Input
                  id="note"
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="What was this for?"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-charcoal-text text-cream-bg rounded-xl font-semibold hover:bg-charcoal-text/80 transition-colors disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Expense"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
