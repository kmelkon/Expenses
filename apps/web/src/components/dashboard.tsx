"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { ProfileRow, ExpenseRow, MonthSummary, CategoryRow, PayerRow } from "@expenses/shared";
import { formatAmount, getCurrentMonth, formatMonthDisplay, getPreviousMonth, getNextMonth } from "@expenses/shared";
import { format } from "date-fns";
import { AppHeader } from "./app-header";
import { WelcomeSection } from "./welcome-section";
import { SummaryCard } from "./summary-card";
import { SpendingFlowChart } from "./spending-flow-chart";
import { CategoryBreakdown } from "./category-breakdown";
import { LatestTransactions } from "./latest-transactions";
import { AddExpenseButton } from "./add-expense-button";
import { Card, SummaryCardSkeleton, ChartSkeleton, CardSkeleton } from "./ui";
import { getExpensesWithPreviousMonth } from "@/lib/queries/expense-queries";
import {
  calculateCategoryBreakdown,
  calculateMonthChange,
  type MonthChange,
  type CategoryBreakdownItem,
} from "@/lib/calculations/spending-calculations";

interface DashboardProps {
  user: User;
  profile: ProfileRow;
}

export function Dashboard({ user, profile }: DashboardProps) {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [payers, setPayers] = useState<PayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<MonthChange | undefined>(undefined);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdownItem[]>([]);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  async function loadData() {
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

    // Fetch current and previous month expenses for trend calculation
    const { current: currentExpenses, previous: previousExpenses } =
      await getExpensesWithPreviousMonth(supabase, profile.household_id!, currentMonth);

    // Reverse for display (latest first) but keep original for charts
    setExpenses([...currentExpenses].reverse());

    // Calculate summary
    const totalsByPerson = payersData?.map(payer => ({
      paid_by: payer.id,
      total: currentExpenses
        .filter(e => e.paid_by === payer.id)
        .reduce((sum, e) => sum + e.amount_cents, 0)
    })) || [];

    const totalsByCategory = categoriesData?.flatMap(cat =>
      payersData?.map(payer => ({
        category: cat.name,
        paid_by: payer.id,
        total: currentExpenses
          .filter(e => e.category === cat.name && e.paid_by === payer.id)
          .reduce((sum, e) => sum + e.amount_cents, 0)
      })) || []
    ).filter(t => t.total > 0) || [];

    const grandTotal = currentExpenses.reduce((sum, e) => sum + e.amount_cents, 0);
    const previousTotal = previousExpenses.reduce((sum, e) => sum + e.amount_cents, 0);

    setSummary({
      totalsByPerson,
      totalsByCategory,
      grandTotal,
    });

    // Calculate trend
    setTrend(calculateMonthChange(grandTotal, previousTotal));

    // Calculate category breakdown
    setCategoryBreakdown(calculateCategoryBreakdown(currentExpenses, categoriesData || []));

    setLoading(false);
  }

  const handlePreviousMonth = () => setCurrentMonth(getPreviousMonth(currentMonth));
  const handleNextMonth = () => setCurrentMonth(getNextMonth(currentMonth));

  // Get month name for display
  const [year, month] = currentMonth.split("-").map(Number);
  const monthName = format(new Date(year, month - 1), "MMMM");

  // State for add expense modal
  const [showAddExpense, setShowAddExpense] = useState(false);

  return (
    <div className="min-h-screen bg-cream-bg text-charcoal-text selection:bg-pastel-peach">
      <AppHeader user={user} profile={profile} activeTab="dashboard" />

      <main className="w-full max-w-3xl mx-auto px-6 pb-20 mt-8">
        <WelcomeSection
          userName={profile.display_name?.split(" ")[0] || "there"}
          monthName={monthName}
          onAddExpense={() => setShowAddExpense(true)}
        />

        {loading ? (
          <div className="flex flex-col gap-8">
            <Card variant="mint"><SummaryCardSkeleton /></Card>
            <Card variant="blue"><ChartSkeleton /></Card>
            <Card variant="peach"><CardSkeleton /></Card>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {summary && (
              <SummaryCard
                summary={summary}
                payers={payers}
                monthName={monthName}
                trend={trend}
              />
            )}
            <SpendingFlowChart expenses={expenses} month={currentMonth} />
            <CategoryBreakdown breakdown={categoryBreakdown} />
            <LatestTransactions expenses={expenses} payers={payers} />
          </div>
        )}

        <AddExpenseButton
          categories={categories}
          payers={payers}
          householdId={profile.household_id!}
          onAdded={loadData}
          forceOpen={showAddExpense}
          onClose={() => setShowAddExpense(false)}
        />
      </main>

      <footer className="text-center pb-8 opacity-50">
        <p className="text-xs font-medium text-charcoal-text">
          {new Date().getFullYear()} OurNest
        </p>
      </footer>
    </div>
  );
}
