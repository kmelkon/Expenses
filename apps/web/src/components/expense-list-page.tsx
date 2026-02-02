"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type {
  ProfileRow,
  ExpenseRow,
  CategoryRow,
  PayerRow,
} from "@expenses/shared";
import {
  getCurrentMonth,
  getPreviousMonth,
  getNextMonth,
  formatMonthDisplay,
} from "@expenses/shared";
import { AppHeader } from "./app-header";
import { MonthNavigator } from "./month-navigator";
import { ExpenseList } from "./expense-list";
import { TransactionSearch } from "./transaction-search";
import { AddExpenseButton } from "./add-expense-button";
import { BottomNav } from "./bottom-nav";

interface ExpenseListPageProps {
  user: User;
  profile: ProfileRow;
}

export function ExpenseListPage({ user, profile }: ExpenseListPageProps) {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [payers, setPayers] = useState<PayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const [year, month] = currentMonth.split("-").map(Number);
      const startDate = `${currentMonth}-01`;
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

      const [{ data: expensesData }, { data: categoriesData }, { data: payersData }] =
        await Promise.all([
          supabase
            .from("expenses")
            .select("*")
            .eq("household_id", profile.household_id)
            .eq("deleted", false)
            .gte("date", startDate)
            .lt("date", endDate)
            .order("date", { ascending: false }),
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
      setLoading(false);
    }
    fetchData();
  }, [currentMonth, profile.household_id, supabase, refreshTrigger]);

  const handleRefresh = () => setRefreshTrigger((t) => t + 1);

  const handlePreviousMonth = () =>
    setCurrentMonth(getPreviousMonth(currentMonth));
  const handleNextMonth = () => setCurrentMonth(getNextMonth(currentMonth));

  // Filter expenses based on search query
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses;

    const query = searchQuery.toLowerCase();
    return expenses.filter((expense) => {
      const matchesNote = expense.note?.toLowerCase().includes(query);
      const matchesCategory = expense.category.toLowerCase().includes(query);
      const matchesAmount = (expense.amount_cents / 100)
        .toFixed(2)
        .includes(query);
      return matchesNote || matchesCategory || matchesAmount;
    });
  }, [expenses, searchQuery]);

  // Get month name for subtitle
  const monthName = formatMonthDisplay(currentMonth);

  return (
    <div className="min-h-screen bg-cream-bg text-charcoal-text selection:bg-pastel-peach">
      <AppHeader user={user} profile={profile} activeTab="expenses" />

      <main className="w-full max-w-3xl mx-auto px-6 pb-20 mt-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-charcoal-text mb-1">
              Transactions
            </h1>
            <p className="text-base text-light-grey-text font-light">
              History of expenses for {monthName}.
            </p>
          </div>
          <AddExpenseButton
            categories={categories}
            payers={payers}
            householdId={profile.household_id!}
            onAdded={handleRefresh}
          />
        </div>

        <TransactionSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <MonthNavigator
          currentMonth={currentMonth}
          onPrevious={handlePreviousMonth}
          onNext={handleNextMonth}
        />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal-text" />
          </div>
        ) : (
          <ExpenseList
            expenses={filteredExpenses}
            payers={payers}
            onRefresh={handleRefresh}
          />
        )}
      </main>

      <BottomNav activeTab="expenses" />
    </div>
  );
}
