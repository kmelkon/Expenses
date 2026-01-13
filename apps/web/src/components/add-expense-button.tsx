"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CategoryRow, PayerRow } from "@expenses/shared";
import { parseAmountInput, getTodayYYYYMMDD } from "@expenses/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { AlertCircle } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

interface AddExpenseButtonProps {
  categories: CategoryRow[];
  payers: PayerRow[];
  householdId: string;
  onAdded: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddExpenseButton({
  categories,
  payers,
  householdId,
  onAdded,
  open,
  onOpenChange,
}: AddExpenseButtonProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]?.name || "");
  const [paidBy, setPaidBy] = useState(payers[0]?.id || "");
  const [date, setDate] = useState(getTodayYYYYMMDD());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setAmount("");
      setNote("");
      setDate(getTodayYYYYMMDD());
      setCategory(categories[0]?.name || "");
      setPaidBy(payers[0]?.id || "");
      setError(null);
    }
  }, [open, categories, payers]);

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

      setLoading(false);
      onOpenChange?.(false);
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-[var(--radius-md)] text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (SEK)</Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              required
              autoFocus
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Paid by */}
          <div className="space-y-2">
            <Label>Paid by</Label>
            <div className="flex gap-3">
              {payers.map(payer => (
                <button
                  key={payer.id}
                  type="button"
                  onClick={() => setPaidBy(payer.id)}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-[var(--radius-lg)] border-2 transition-all",
                    "flex flex-col items-center gap-2",
                    "hover:bg-[var(--warm-50)] active:scale-[0.98]",
                    paidBy === payer.id
                      ? "border-[var(--terracotta-500)] bg-[var(--terracotta-50)]"
                      : "border-[var(--warm-200)] bg-white"
                  )}
                >
                  <Avatar name={payer.display_name} size="sm" />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      paidBy === payer.id
                        ? "text-[var(--terracotta-700)]"
                        : "text-[var(--warm-700)]"
                    )}
                  >
                    {payer.display_name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input
              id="note"
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="What was this for?"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Adding..." : "Add Expense"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
