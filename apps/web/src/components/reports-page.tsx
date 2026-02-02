"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { ProfileRow, ExpenseRow, CategoryRow, PayerRow } from "@expenses/shared";
import { getCurrentMonth, getPreviousMonth, formatMonthDisplay } from "@expenses/shared";
import { format } from "date-fns";
import { AppHeader } from "./app-header";
import { Card, ChartSkeleton, CardSkeleton } from "./ui";
import { MonthRangeSelector, type RangeOption } from "./month-range-selector";
import { MonthlyComparisonChart } from "./monthly-comparison-chart";
import { CategoryTrendsChart } from "./category-trends-chart";
import { PayerBalanceCard } from "./payer-balance-card";
import { BottomNav } from "./bottom-nav";
import { getExpensesForMonths } from "@/lib/queries/expense-queries";
import {
  calculateMonthlyTotals,
  calculateCategoryTrends,
  calculatePayerBalance,
} from "@/lib/calculations/spending-calculations";

interface ReportsPageProps {
  user: User;
  profile: ProfileRow;
}

export function ReportsPage({ user, profile }: ReportsPageProps) {
  const [range, setRange] = useState<RangeOption>("6");
  const [loading, setLoading] = useState(true);
  const [expensesByMonth, setExpensesByMonth] = useState<Map<string, ExpenseRow[]>>(new Map());
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [payers, setPayers] = useState<PayerRow[]>([]);
  const [balanceMonth, setBalanceMonth] = useState(getCurrentMonth());

  const supabase = createClient();
  const currentMonth = getCurrentMonth();

  // Generate months array based on range
  const months = useMemo(() => {
    const result: string[] = [];
    let month = currentMonth;
    for (let i = 0; i < parseInt(range); i++) {
      result.unshift(month);
      month = getPreviousMonth(month);
    }
    return result;
  }, [range, currentMonth]);

  const loadData = useCallback(async () => {
    setLoading(true);

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

    setCategories(categoriesData || []);
    setPayers(payersData || []);

    // Fetch expenses for all months in range
    const expensesMap = await getExpensesForMonths(
      supabase,
      profile.household_id!,
      months
    );

    setExpensesByMonth(expensesMap);
    setLoading(false);
  }, [supabase, profile.household_id, months]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate data for charts
  const monthlyTotals = useMemo(
    () => calculateMonthlyTotals(expensesByMonth),
    [expensesByMonth]
  );

  const categoryTrends = useMemo(
    () => calculateCategoryTrends(expensesByMonth, categories),
    [expensesByMonth, categories]
  );

  // Calculate payer balance for selected balance month
  const payerBalances = useMemo(() => {
    const balanceMonthExpenses = expensesByMonth.get(balanceMonth) || [];
    return calculatePayerBalance(balanceMonthExpenses, payers);
  }, [expensesByMonth, balanceMonth, payers]);

  // Get month labels
  const [year, month] = currentMonth.split("-").map(Number);
  const currentMonthLabel = format(new Date(year, month - 1), "MMMM yyyy");
  const balanceMonthLabel = formatMonthDisplay(balanceMonth);

  return (
    <div className="min-h-screen bg-cream-bg text-charcoal-text selection:bg-pastel-peach">
      <AppHeader user={user} profile={profile} activeTab="reports" />

      <main className="w-full max-w-3xl mx-auto px-6 pb-20 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-charcoal-text mb-2">
              Spending Reports
            </h1>
            <p className="text-lg text-light-grey-text font-light">
              Detailed analytics for {currentMonthLabel}.
            </p>
          </div>
          <MonthRangeSelector value={range} onChange={setRange} />
        </div>

        {loading ? (
          <div className="flex flex-col gap-8">
            <Card variant="mint"><ChartSkeleton /></Card>
            <Card variant="blue"><CardSkeleton /></Card>
            <Card variant="peach"><ChartSkeleton /></Card>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <MonthlyComparisonChart data={monthlyTotals} />
            <PayerBalanceCard
              balances={payerBalances}
              monthLabel={balanceMonthLabel}
              currentMonth={balanceMonth}
              onMonthChange={setBalanceMonth}
            />
            <CategoryTrendsChart data={categoryTrends} />
          </div>
        )}
      </main>

      <footer className="text-center pb-8 opacity-50 hidden md:block">
        <p className="text-xs font-medium text-charcoal-text">
          {new Date().getFullYear()} OurNest
        </p>
      </footer>

      <BottomNav activeTab="reports" />
    </div>
  );
}
