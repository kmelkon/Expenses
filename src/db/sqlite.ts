import * as SQLite from "expo-sqlite";

const DB_NAME = "expenses.db";

let _db: SQLite.SQLiteDatabase | null = null;
let opening: Promise<SQLite.SQLiteDatabase> | null = null;

type DBTask<T> = (db: SQLite.SQLiteDatabase) => Promise<T>;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (_db) {
    return _db;
  }

  if (!opening) {
    opening = (async () => {
      try {
        const db = await SQLite.openDatabaseAsync(DB_NAME);
        await db.execAsync("PRAGMA journal_mode=WAL;");
        await runMigrations(db);
        _db = db;
        return db;
      } finally {
        opening = null;
      }
    })();
  }

  return opening!;
}

export async function query<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  return withDB(async (db) => {
    const rows = await db.getAllAsync(sql, params);
    return rows as T[];
  });
}

export async function exec(sql: string, params: any[] = []): Promise<void> {
  await withDB(async (db) => {
    await db.runAsync(sql, params);
  });
}

async function withDB<T>(fn: DBTask<T>, retried = false): Promise<T> {
  try {
    const db = await getDB();
    return await fn(db);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : error != null
        ? String(error)
        : "";

    if (
      message &&
      /(non-normal file|prepareAsync|database is closed|nullpointer)/i.test(
        message
      )
    ) {
      if (/non-normal file/i.test(message)) {
        try {
          await SQLite.deleteDatabaseAsync?.(DB_NAME);
        } catch {
          // ignore cleanup failure; we'll retry with a fresh connection
        }
      }

      _db = null;
      opening = null;

      if (!retried) {
        return withDB(fn, true);
      }
    }

    throw error;
  }
}

type Migration = {
  toVersion: number;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
};

const MIGRATIONS: Migration[] = [
  {
    toVersion: 1,
    up: async (db) => {
      await db.execAsync(`
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

      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
        CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
        CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
      `);
    },
  },
  {
    toVersion: 2,
    up: async (db) => {
      // Create categories table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          display_order INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);

      // Seed default categories
      const defaultCategories = [
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
      ];

      for (let i = 0; i < defaultCategories.length; i++) {
        const category = defaultCategories[i];
        await db.runAsync(
          `INSERT INTO categories (id, name, display_order) VALUES (?, ?, ?)`,
          [category.toLowerCase().replace(/\s+/g, "_"), category, i]
        );
      }

      // Create payers table
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS payers (
          id TEXT PRIMARY KEY,
          display_name TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);

      // Seed default payers
      await db.runAsync(`INSERT INTO payers (id, display_name) VALUES (?, ?)`, [
        "hubby",
        "Karam",
      ]);
      await db.runAsync(`INSERT INTO payers (id, display_name) VALUES (?, ?)`, [
        "wifey",
        "Kazi",
      ]);

      // Migrate expenses table to use foreign keys instead of CHECK constraints
      // SQLite doesn't support dropping constraints, so we need to recreate the table
      await db.execAsync(`
        CREATE TABLE expenses_new (
          id TEXT PRIMARY KEY,
          amount_cents INTEGER NOT NULL,
          paid_by TEXT NOT NULL,
          date TEXT NOT NULL,
          note TEXT NULL,
          category TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted INTEGER NOT NULL DEFAULT 0,
          dirty INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (paid_by) REFERENCES payers(id),
          FOREIGN KEY (category) REFERENCES categories(name)
        );
      `);

      // Copy existing data
      await db.execAsync(`
        INSERT INTO expenses_new 
        SELECT * FROM expenses;
      `);

      // Drop old table and rename new one
      await db.execAsync(`DROP TABLE expenses;`);
      await db.execAsync(`ALTER TABLE expenses_new RENAME TO expenses;`);

      // Recreate indexes
      await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
        CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON expenses(paid_by);
        CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
      `);
    },
  },
  {
    toVersion: 3,
    up: async (db) => {
      // Update existing payer IDs from old naming to new naming
      // This handles existing databases that were created before the rename
      await db.runAsync(`UPDATE payers SET id = ? WHERE id = ?`, [
        "hubby",
        "you",
      ]);
      await db.runAsync(`UPDATE payers SET id = ? WHERE id = ?`, [
        "wifey",
        "partner",
      ]);

      // Update all expenses to use the new payer IDs
      await db.runAsync(`UPDATE expenses SET paid_by = ? WHERE paid_by = ?`, [
        "hubby",
        "you",
      ]);
      await db.runAsync(`UPDATE expenses SET paid_by = ? WHERE paid_by = ?`, [
        "wifey",
        "partner",
      ]);
    },
  },
];

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    const rows = await db.getAllAsync<{ user_version: number }>(
      "PRAGMA user_version;"
    );
    let currentVersion = rows[0]?.user_version ?? 0;

    for (const migration of MIGRATIONS) {
      if (currentVersion < migration.toVersion) {
        await migration.up(db);
        if (!Number.isSafeInteger(migration.toVersion)) {
          throw new Error(
            `Invalid migration.toVersion: ${migration.toVersion}`
          );
        }
        await db.execAsync(`PRAGMA user_version = ${migration.toVersion};`);
        currentVersion = migration.toVersion;
      }
    }
  });
}
