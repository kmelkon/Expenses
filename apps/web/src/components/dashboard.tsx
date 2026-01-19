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
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal-text"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {summary && (
              <SummaryCard
                summary={summary}
                payers={payers}
                monthName={monthName}
              />
            )}
            <SpendingFlowChart />
            <CategoryBreakdown />
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
