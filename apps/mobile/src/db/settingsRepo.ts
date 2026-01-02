import { exec, query } from "./sqlite";

export type ThemePreference = "light" | "dark" | "system";

type AppSettingRow = {
  key: string;
  value: string;
};

const THEME_KEY = "theme_preference";
const DEFAULT_THEME: ThemePreference = "system";

async function getSetting(key: string): Promise<string | null> {
  const rows = await query<AppSettingRow>(
    `SELECT key, value FROM app_settings WHERE key = ? LIMIT 1`,
    [key]
  );

  return rows[0]?.value ?? null;
}

async function setSetting(key: string, value: string): Promise<void> {
  await exec(
    `
    INSERT INTO app_settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `,
    [key, value]
  );
}

export async function getThemePreference(): Promise<ThemePreference> {
  const stored = await getSetting(THEME_KEY);

  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }

  return DEFAULT_THEME;
}

export async function setThemePreference(
  preference: ThemePreference
): Promise<void> {
  await setSetting(THEME_KEY, preference);
}
