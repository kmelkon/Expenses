import * as SQLite from "expo-sqlite";

export interface DatabaseSchema {
  expenses: {
    id: string;
    amount_cents: number;
    paid_by: "you" | "partner";
    date: string; // 'YYYY-MM-DD'
    note: string | null;
    category: string;
    created_at: string; // ISO timestamp
    updated_at: string; // ISO timestamp
    deleted: number; // 0 or 1
    dirty: number; // 0 or 1, for future sync
  };
}

export const CATEGORIES = [
  "Groceries",
  "Rent",
  "Mortgage",
  "Electricity",
  "Electricity network",
  "Garbage collection",
  "Internet",
  "Bensin",
  "House insurance",
  "Car insurance",
  "Eating out",
  "Kid",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type PayerId = "you" | "partner";

let db: SQLite.SQLiteDatabase | null = null;

export async function openDB(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }

  db = await SQLite.openDatabaseAsync("expenses.db");
  await runMigrations(db);
  return db;
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  // Create expenses table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount_cents INTEGER NOT NULL,
      paid_by TEXT NOT NULL CHECK (paid_by IN ('you','partner')),
      date TEXT NOT NULL,
      note TEXT NULL,
      category TEXT NOT NULL CHECK (category IN (
        'Groceries','Rent','Mortgage','Electricity','Electricity network',
        'Garbage collection','Internet','Bensin','House insurance',
        'Car insurance','Eating out','Kid'
      )),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted INTEGER NOT NULL DEFAULT 0,
      dirty INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Create indexes
  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
  `);
}

export async function runSQL<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  const database = await openDB();
  const result = await database.getAllAsync(query, params);
  return result as T[];
}

export async function runSQLSingle<T = any>(
  query: string,
  params: any[] = []
): Promise<T | null> {
  const database = await openDB();
  const result = await database.getFirstAsync(query, params);
  return (result as T) || null;
}

export async function runSQLExec(
  query: string,
  params: any[] = []
): Promise<SQLite.SQLiteRunResult> {
  const database = await openDB();
  return await database.runAsync(query, params);
}

export async function runTransaction(
  callback: () => Promise<void>
): Promise<void> {
  const database = await openDB();
  return await database.withTransactionAsync(callback);
}
