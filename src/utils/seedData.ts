import { addExpense } from "../db/expenseRepo";
import { getTodayYYYYMMDD } from "../utils/date";

export async function seedTestData() {
  if (!__DEV__) {
    return; // Only seed in development
  }

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

    console.log("Seeding test data...");
    for (const expense of sampleExpenses) {
      await addExpense(expense);
    }
    console.log("Test data seeded successfully!");
  } catch (error) {
    console.warn("Failed to seed test data:", error);
  }
}
