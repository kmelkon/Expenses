"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CategoryRow, PayerRow } from "@expenses/shared";
import { parseAmountInput, getTodayYYYYMMDD } from "@expenses/shared";
import { Input, Select, Label } from "@/components/ui";

interface AddExpenseButtonProps {
  categories: CategoryRow[];
  payers: PayerRow[];
  householdId: string;
  onAdded: () => void;
}

export function AddExpenseButton({ categories, payers, householdId, onAdded }: AddExpenseButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]?.name || "");
  const [paidBy, setPaidBy] = useState(payers[0]?.id || "");
  const [date, setDate] = useState(getTodayYYYYMMDD());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountCents = parseAmountInput(amount);
    if (!amountCents) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);

    const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await supabase.from("expenses").insert({
      id,
      household_id: householdId,
      amount_cents: amountCents,
      paid_by: paidBy,
      date,
      note: note || null,
      category,
    });

    setAmount("");
    setNote("");
    setDate(getTodayYYYYMMDD());
    setIsOpen(false);
    setLoading(false);
    onAdded();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        aria-label="Add expense"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:max-w-md sm:rounded-lg rounded-t-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Expense</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

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
                      className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                        paidBy === payer.id
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
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
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
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
