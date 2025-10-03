import { create } from "zustand";
import {
  ExpenseRow,
  getExpensesByMonth,
  getMonthSummary,
  MonthSummary,
} from "../db/expenseRepo";
import { getCurrentMonth } from "../utils/date";

interface MonthState {
  selectedMonth: string; // YYYY-MM format
  expenses: ExpenseRow[];
  summary: MonthSummary | null;
  isLoading: boolean;
  error: string | null;
}

interface MonthActions {
  setSelectedMonth: (month: string) => void;
  loadMonthData: () => Promise<void>;
  refreshData: () => Promise<void>;
  resetToCurrentMonth: () => void;
}

type MonthStore = MonthState & MonthActions;

export const useMonthStore = create<MonthStore>((set, get) => ({
  // Initial state
  selectedMonth: getCurrentMonth(),
  expenses: [],
  summary: null,
  isLoading: false,
  error: null,

  // Actions
  setSelectedMonth: (month: string) => {
    set({ selectedMonth: month });
    // Automatically load data for the new month
    get().loadMonthData();
  },

  loadMonthData: async () => {
    const { selectedMonth } = get();
    set({ isLoading: true, error: null });

    try {
      const [expenses, summary] = await Promise.all([
        getExpensesByMonth(selectedMonth),
        getMonthSummary(selectedMonth),
      ]);

      set({
        expenses,
        summary,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load month data:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to load data",
        isLoading: false,
      });
    }
  },

  refreshData: async () => {
    await get().loadMonthData();
  },

  resetToCurrentMonth: () => {
    const currentMonth = getCurrentMonth();
    set({ selectedMonth: currentMonth });
    get().loadMonthData();
  },
}));
