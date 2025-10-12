import { create } from "zustand";
import {
  getThemePreference as dbGetThemePreference,
  setThemePreference as dbSetThemePreference,
  ThemePreference,
} from "../db/settingsRepo";

export type { ThemePreference } from "../db/settingsRepo";

type AppearanceState = {
  themePreference: ThemePreference;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
};

type AppearanceActions = {
  loadThemePreference: () => Promise<void>;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
};

type AppearanceStore = AppearanceState & AppearanceActions;

export const useAppearanceStore = create<AppearanceStore>((set) => ({
  themePreference: "system",
  isLoaded: false,
  isLoading: false,
  error: null,

  loadThemePreference: async () => {
    set({ isLoading: true, error: null });

    try {
      const preference = await dbGetThemePreference();

      set({
        themePreference: preference,
        isLoaded: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load theme preference:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load theme preference",
        isLoading: false,
        isLoaded: true,
      });
    }
  },

  setThemePreference: async (preference) => {
    set({ themePreference: preference });

    try {
      await dbSetThemePreference(preference);
    } catch (error) {
      console.error("Failed to persist theme preference:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to save theme preference",
      });
      throw error;
    }
  },
}));
