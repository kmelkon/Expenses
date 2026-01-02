import { create } from "zustand";
import {
  CategoryRow,
  PayerRow,
  addCategory as dbAddCategory,
  addPayer as dbAddPayer,
  deleteCategory as dbDeleteCategory,
  deletePayer as dbDeletePayer,
  updateCategoryOrder as dbUpdateCategoryOrder,
  updatePayerDisplayName as dbUpdatePayerDisplayName,
  getAllCategories,
  getAllPayers,
} from "../db/expenseRepo";

interface SettingsState {
  categories: CategoryRow[];
  payers: PayerRow[];
  isLoading: boolean;
  error: string | null;
}

interface SettingsActions {
  loadSettings: () => Promise<void>;
  // Category actions
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (name: string) => Promise<void>;
  updateCategoryOrder: (
    updates: { name: string; display_order: number }[]
  ) => Promise<void>;
  // Payer actions
  addPayer: (id: string, displayName: string) => Promise<void>;
  updatePayerDisplayName: (id: string, displayName: string) => Promise<void>;
  deletePayer: (id: string) => Promise<void>;
}

type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // Initial state
  categories: [],
  payers: [],
  isLoading: false,
  error: null,

  // Actions
  loadSettings: async () => {
    set({ isLoading: true, error: null });

    try {
      const [categories, payers] = await Promise.all([
        getAllCategories(),
        getAllPayers(),
      ]);

      set({
        categories,
        payers,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load settings:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to load settings",
        isLoading: false,
      });
    }
  },

  // Category actions
  addCategory: async (name: string) => {
    try {
      await dbAddCategory(name);
      await get().loadSettings(); // Reload to get updated list
    } catch (error) {
      console.error("Failed to add category:", error);
      throw error;
    }
  },

  deleteCategory: async (name: string) => {
    try {
      await dbDeleteCategory(name);
      await get().loadSettings(); // Reload to get updated list
    } catch (error) {
      console.error("Failed to delete category:", error);
      throw error;
    }
  },

  updateCategoryOrder: async (
    updates: { name: string; display_order: number }[]
  ) => {
    try {
      await dbUpdateCategoryOrder(updates);
      await get().loadSettings(); // Reload to get updated order
    } catch (error) {
      console.error("Failed to update category order:", error);
      throw error;
    }
  },

  // Payer actions
  addPayer: async (id: string, displayName: string) => {
    try {
      await dbAddPayer(id, displayName);
      await get().loadSettings(); // Reload to get updated list
    } catch (error) {
      console.error("Failed to add payer:", error);
      throw error;
    }
  },

  updatePayerDisplayName: async (id: string, displayName: string) => {
    try {
      await dbUpdatePayerDisplayName(id, displayName);
      await get().loadSettings(); // Reload to get updated display name
    } catch (error) {
      console.error("Failed to update payer display name:", error);
      throw error;
    }
  },

  deletePayer: async (id: string) => {
    try {
      await dbDeletePayer(id);
      await get().loadSettings(); // Reload to get updated list
    } catch (error) {
      console.error("Failed to delete payer:", error);
      throw error;
    }
  },
}));

// ============================================================================
// Convenience hooks for accessing categories and payers
// ============================================================================

/**
 * Get all available categories ordered by display_order
 */
export const useCategories = () =>
  useSettingsStore((state) => state.categories);

/**
 * Get all available payers
 */
export const usePayers = () => useSettingsStore((state) => state.payers);

/**
 * Get a payer's display name by ID
 */
export const usePayerDisplayName = (payerId: string): string => {
  const payers = usePayers();
  return payers.find((p) => p.id === payerId)?.display_name || payerId;
};
