import type { SQLiteDatabase } from "expo-sqlite";
import { addExpense } from "../db/expenseRepo";
import { getTodayYYYYMMDD } from "../utils/date";

/**
 * Seeds the database with test data for development.
 * Only call this function when __DEV__ && process.env.EXPO_PUBLIC_SEED === '1'
 *
 * @param db - The SQLite database instance
 */
export async function seed(db: SQLiteDatabase): Promise<void> {
  try {
    // Add some sample expenses for the current month
    const today = getTodayYYYYMMDD();
    const currentMonth = today.substring(0, 7); // YYYY-MM

    const sampleExpenses = [
      {
        amount_cents: 45000, // 450 SEK
        paid_by: "you" as const,
        date: `${currentMonth}-01`,
        category: "Groceries" as const,
        note: "Weekly groceries at ICA",
      },
      {
        amount_cents: 1200000, // 12000 SEK
        paid_by: "partner" as const,
        date: `${currentMonth}-01`,
        category: "Rent" as const,
        note: "Monthly rent payment",
      },
      {
        amount_cents: 32000, // 320 SEK
        paid_by: "you" as const,
        date: `${currentMonth}-02`,
        category: "Eating out" as const,
        note: "Dinner at restaurant",
      },
      {
        amount_cents: 85000, // 850 SEK
        paid_by: "partner" as const,
        date: `${currentMonth}-03`,
        category: "Electricity" as const,
        note: "Monthly electricity bill",
      },
      {
        amount_cents: 65000, // 650 SEK
        paid_by: "you" as const,
        date: today,
        category: "Groceries" as const,
        note: "Fresh vegetables and meat",
      },
    ];

    console.log("[DEV] Seeding test data...");
    for (const expense of sampleExpenses) {
      await addExpense(expense);
    }
    console.log("[DEV] Test data seeded successfully!");
  } catch (error) {
    console.warn("[DEV] Failed to seed test data:", error);
  }
}
