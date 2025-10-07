import { subMonths } from "date-fns";
import type { SQLiteDatabase } from "expo-sqlite";
import { addExpense } from "../db/expenseRepo";
import {
  formatMonthDisplay,
  toYYYYMM,
  toYYYYMMDD,
} from "../utils/date";

type SeedExpense = Parameters<typeof addExpense>[0];

/**
 * Seeds the database with richer test data for development.
 *
 * @param db - The SQLite database instance
 * @returns Whether any expenses were inserted
 */
export async function seed(db: SQLiteDatabase): Promise<boolean> {
  try {
    const existingRows = await db.getAllAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM expenses WHERE deleted = 0"
    );
    const existingCount = Number(existingRows[0]?.count ?? 0);

    if (existingCount > 0) {
      console.warn(
        `[DEV] Seed skipped: ${existingCount} expense(s) already present. Reset the database to seed again.`
      );
      return false;
    }

    const monthsToGenerate = 6;
    const fixtures: SeedExpense[] = [];
    const baseDate = new Date();

    for (let offset = 0; offset < monthsToGenerate; offset++) {
      const monthDate = subMonths(baseDate, offset);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      const yyyyMM = toYYYYMM(monthDate);
      const displayMonth = formatMonthDisplay(yyyyMM);
      const variation = monthsToGenerate - offset;
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

      const buildDate = (day: number) =>
        toYYYYMMDD(new Date(year, month, Math.min(day, lastDayOfMonth)));

      fixtures.push(
        {
          amount_cents: 1200000,
          paid_by: "wifey",
          date: buildDate(1),
          category: "Rent",
          note: `${displayMonth} rent`,
        },
        {
          amount_cents: 42000 + variation * 1200,
          paid_by: "hubby",
          date: buildDate(5),
          category: "Groceries",
          note: `${displayMonth} groceries run`,
        },
        {
          amount_cents: 68000 + variation * 900,
          paid_by: "wifey",
          date: buildDate(12),
          category: "Electricity",
          note: `${displayMonth} electricity bill`,
        },
        {
          amount_cents: 28000 + variation * 700,
          paid_by: offset % 2 === 0 ? "hubby" : "wifey",
          date: buildDate(18),
          category: "Eating out",
          note: `${displayMonth} date night`,
        },
        {
          amount_cents: 19500 + variation * 300,
          paid_by: "hubby",
          date: buildDate(22),
          category: "Kid",
          note: `${displayMonth} activities for the kids`,
        },
        {
          amount_cents: 36000 + variation * 500,
          paid_by: offset % 2 === 0 ? "wifey" : "hubby",
          date: buildDate(26),
          category: "Bensin",
          note: `${displayMonth} fuel top-up`,
        },
        {
          amount_cents: 49900,
          paid_by: "wifey",
          date: buildDate(28),
          category: "Internet",
          note: `${displayMonth} fiber internet`,
        }
      );
    }

    console.log(
      `[DEV] Seeding ${fixtures.length} expenses across ${monthsToGenerate} month(s)...`
    );

    for (const expense of fixtures) {
      await addExpense(expense);
    }

    console.log("[DEV] Test data seeded successfully!");
    return true;
  } catch (error) {
    console.warn("[DEV] Failed to seed test data:", error);
    throw error;
  }
}
