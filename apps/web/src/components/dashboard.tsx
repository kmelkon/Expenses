"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { ProfileRow, ExpenseRow, MonthSummary, CategoryRow, PayerRow } from "@expenses/shared";
import { formatAmount, getCurrentMonth, formatMonthDisplay, getPreviousMonth, getNextMonth } from "@expenses/shared";
import { ExpenseList } from "./expense-list";
import { MonthNavigator } from "./month-navigator";
import { TotalsTable } from "./totals-table";
import { AddExpenseButton } from "./add-expense-button";
import { Header } from "./header";

interface DashboardProps {
  user: User;
  profile: ProfileRow;
}

/**
 * Render the household dashboard with month navigation, expense list, totals, and controls for adding expenses.
 *
 * Fetches expenses, categories, and payers for the selected month and computes a summary (totals by person, totals by category, and grand total) whenever the current month changes.
 *
 * @param user - The current authenticated user
 * @param profile - The user's household profile; `profile.household_id` is used to scope data queries
 * @returns The dashboard's JSX element tree
 */
export function Dashboard({ user, profile }: DashboardProps) {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [payers, setPayers] = useState<PayerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  async function loadData() {
    setLoading(true);

    const [year, month] = currentMonth.split("-").map(Number);
    const startDate = `${currentMonth}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

    // Fetch expenses for the month
    const { data: expensesData } = await supabase
      .from("expenses")
      .select("*")
      .eq("household_id", profile.household_id)
      .eq("deleted", false)
      .gte("date", startDate)
      .lt("date", endDate)
      .order("date", { ascending: false });

    // Fetch categories and payers
    const [{ data: categoriesData }, { data: payersData }] = await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .eq("household_id", profile.household_id)
        .order("display_order"),
      supabase
        .from("payers")
        .select("*")
        .eq("household_id", profile.household_id),
    ]);

    setExpenses(expensesData || []);
    setCategories(categoriesData || []);
    setPayers(payersData || []);

    // Calculate summary
    if (expensesData) {
      const totalsByPerson = payersData?.map(payer => ({
        paid_by: payer.id,
        total: expensesData
          .filter(e => e.paid_by === payer.id)
          .reduce((sum, e) => sum + e.amount_cents, 0)
      })) || [];

      const totalsByCategory = categoriesData?.flatMap(cat =>
        payersData?.map(payer => ({
          category: cat.name,
          paid_by: payer.id,
          total: expensesData
            .filter(e => e.category === cat.name && e.paid_by === payer.id)
            .reduce((sum, e) => sum + e.amount_cents, 0)
        })) || []
      ).filter(t => t.total > 0) || [];

      setSummary({
        totalsByPerson,
        totalsByCategory,
        grandTotal: expensesData.reduce((sum, e) => sum + e.amount_cents, 0)
      });
    }

    setLoading(false);
  }

  const handlePreviousMonth = () => setCurrentMonth(getPreviousMonth(currentMonth));
  const handleNextMonth = () => setCurrentMonth(getNextMonth(currentMonth));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} profile={profile} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <MonthNavigator
          currentMonth={currentMonth}
          onPrevious={handlePreviousMonth}
          onNext={handleNextMonth}
        />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {summary && <TotalsTable summary={summary} payers={payers} />}
            <ExpenseList
              expenses={expenses}
              payers={payers}
              onRefresh={loadData}
            />
          </>
        )}

        <AddExpenseButton
          categories={categories}
          payers={payers}
          householdId={profile.household_id!}
          onAdded={loadData}
        />
      </main>
    </div>
  );
}