"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { ProfileRow, ExpenseRow, MonthSummary, CategoryRow, PayerRow } from "@expenses/shared";
import { getCurrentMonth, getPreviousMonth, getNextMonth } from "@expenses/shared";
import { ExpenseList } from "./expense-list";
import { MonthNavigator } from "./month-navigator";
import { HeroTotalCard } from "./hero-total-card";
import { AddExpenseButton } from "./add-expense-button";
import { AppShell } from "./layout/app-shell";
import { Loader2 } from "@/components/ui/icons";

interface DashboardProps {
  user: User;
  profile: ProfileRow;
}

export function Dashboard({ user, profile }: DashboardProps) {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [previousMonthTotal, setPreviousMonthTotal] = useState<number | undefined>(undefined);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [payers, setPayers] = useState<PayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

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

    // Calculate previous month date range
    const prevMonth = getPreviousMonth(currentMonth);
    const [prevYear, prevMonthNum] = prevMonth.split("-").map(Number);
    const prevStartDate = `${prevMonth}-01`;
    const prevNextMonth = prevMonthNum === 12 ? 1 : prevMonthNum + 1;
    const prevNextYear = prevMonthNum === 12 ? prevYear + 1 : prevYear;
    const prevEndDate = `${prevNextYear}-${String(prevNextMonth).padStart(2, "0")}-01`;

    // Fetch expenses for the month
    const { data: expensesData } = await supabase
      .from("expenses")
      .select("*")
      .eq("household_id", profile.household_id)
      .eq("deleted", false)
      .gte("date", startDate)
      .lt("date", endDate)
      .order("date", { ascending: false });

    // Fetch previous month expenses for trend calculation
    const { data: prevExpensesData } = await supabase
      .from("expenses")
      .select("amount_cents")
      .eq("household_id", profile.household_id)
      .eq("deleted", false)
      .gte("date", prevStartDate)
      .lt("date", prevEndDate);

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

    // Calculate previous month total for trend
    const prevTotal = prevExpensesData?.reduce((sum, e) => sum + e.amount_cents, 0);
    setPreviousMonthTotal(prevTotal && prevTotal > 0 ? prevTotal : undefined);

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
    <AppShell
      title="Expenses"
      userName={profile.display_name}
      onAddClick={() => setAddModalOpen(true)}
    >
      <MonthNavigator
        currentMonth={currentMonth}
        onPrevious={handlePreviousMonth}
        onNext={handleNextMonth}
        onSelectMonth={setCurrentMonth}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-[var(--terracotta-500)] animate-spin" />
        </div>
      ) : (
        <>
          {summary && (
            <HeroTotalCard
              summary={summary}
              previousMonthTotal={previousMonthTotal}
              payers={payers}
            />
          )}
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
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
      />
    </AppShell>
  );
}
