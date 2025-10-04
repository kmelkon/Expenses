import { CATEGORIES, Category, PAYER_IDS, PayerId } from "./schema";
import { exec, query } from "./sqlite";

export interface ExpenseRow {
  id: string;
  amount_cents: number;
  paid_by: PayerId;
  date: string; // 'YYYY-MM-DD'
  note: string | null;
  category: Category;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  deleted: number; // 0 or 1
  dirty: number; // 0 or 1
}

export interface AddExpenseInput {
  amount_cents: number;
  paid_by: PayerId;
  date: string; // 'YYYY-MM-DD'
  note?: string;
  category: Category;
}

export interface PersonTotal {
  paid_by: PayerId;
  total: number;
}

export interface CategoryPersonTotal {
  category: Category;
  paid_by: PayerId;
  total: number;
}

export interface MonthSummary {
  totalsByPerson: PersonTotal[];
  totalsByCategory: CategoryPersonTotal[];
  grandTotal: number;
  youTotal: number;
  partnerTotal: number;
}

function generateId(): string {
  return "exp_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

export async function addExpense(input: AddExpenseInput): Promise<string> {
  const id = generateId();
  const now = new Date().toISOString();

  await exec(
    `
    INSERT INTO expenses (
      id, amount_cents, paid_by, date, note, category, created_at, updated_at, deleted, dirty
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
  `,
    [
      id,
      input.amount_cents,
      input.paid_by,
      input.date,
      input.note || null,
      input.category,
      now,
      now,
    ]
  );

  return id;
}

export async function getExpensesByMonth(
  yyyyMM: string
): Promise<ExpenseRow[]> {
  const startDate = `${yyyyMM}-01`;
  const year = parseInt(yyyyMM.substring(0, 4));
  const month = parseInt(yyyyMM.substring(5, 7));
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = `${nextYear}-${nextMonth.toString().padStart(2, "0")}-01`;

  return await query<ExpenseRow>(
    `
    SELECT * FROM expenses 
    WHERE deleted = 0 
      AND date >= ? 
      AND date < ?
    ORDER BY date DESC, created_at DESC
  `,
    [startDate, endDate]
  );
}

export async function getMonthSummary(yyyyMM: string): Promise<MonthSummary> {
  const startDate = `${yyyyMM}-01`;
  const year = parseInt(yyyyMM.substring(0, 4));
  const month = parseInt(yyyyMM.substring(5, 7));
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = `${nextYear}-${nextMonth.toString().padStart(2, "0")}-01`;

  // Get totals by person
  const totalsByPerson = await query<PersonTotal>(
    `
    SELECT paid_by, SUM(amount_cents) as total
    FROM expenses
    WHERE deleted = 0 
      AND date >= ? 
      AND date < ?
    GROUP BY paid_by
  `,
    [startDate, endDate]
  );

  // Get totals by category and person
  const rawTotalsByCategory = await query<CategoryPersonTotal>(
    `
    SELECT category, paid_by, SUM(amount_cents) as total
    FROM expenses
    WHERE deleted = 0 
      AND date >= ? 
      AND date < ?
    GROUP BY category, paid_by
    ORDER BY category, paid_by
  `,
    [startDate, endDate]
  );

  // Normalize category × person matrix to include zeros for missing combinations
  const totalsByCategoryMap = new Map<string, CategoryPersonTotal>();
  for (const row of rawTotalsByCategory) {
    const key = `${row.category}|${row.paid_by}`;
    totalsByCategoryMap.set(key, row);
  }

  const totalsByCategory: CategoryPersonTotal[] = [];
  for (const category of CATEGORIES) {
    for (const payerId of PAYER_IDS) {
      const key = `${category}|${payerId}`;
      const existing = totalsByCategoryMap.get(key);
      totalsByCategory.push(
        existing || { category, paid_by: payerId, total: 0 }
      );
    }
  }

  // Calculate grand total and individual totals
  const grandTotal = totalsByPerson.reduce((sum, item) => sum + item.total, 0);
  const youTotal =
    totalsByPerson.find((item) => item.paid_by === "you")?.total || 0;
  const partnerTotal =
    totalsByPerson.find((item) => item.paid_by === "partner")?.total || 0;

  return {
    totalsByPerson,
    totalsByCategory,
    grandTotal,
    youTotal,
    partnerTotal,
  };
}

export async function deleteExpense(id: string): Promise<void> {
  const now = new Date().toISOString();

  await exec(
    `
    UPDATE expenses 
    SET deleted = 1, updated_at = ?, dirty = 1
    WHERE id = ?
  `,
    [now, id]
  );
}

export async function getExpenseById(id: string): Promise<ExpenseRow | null> {
  return await querySingle<ExpenseRow>(
    `
    SELECT * FROM expenses 
    WHERE id = ? AND deleted = 0
  `,
    [id]
  );
}

async function querySingle<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
