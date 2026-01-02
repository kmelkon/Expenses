import { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "../db/supabaseClient";

interface AuthState {
  session: Session | null;
  isHydrating: boolean;
  error: string | null;
}

interface AuthActions {
  initialize: () => Promise<void>;
  setError: (message: string | null) => void;
  signOut: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => {
  supabase.auth.onAuthStateChange((_event, session) => {
    set({
      session,
      isHydrating: false,
      error: null,
    });
  });

  return {
    session: null,
    isHydrating: true,
    error: null,

    initialize: async () => {
      const { data, error } = await supabase.auth.getSession();

      set({
        session: data.session ?? null,
        isHydrating: false,
        error: error?.message ?? null,
      });
    },

    setError: (message) => set({ error: message }),

    signOut: async () => {
      const { error } = await supabase.auth.signOut();

      if (error) {
        set({ error: error.message });
        throw error;
      }

      set({ session: null });
    },
  };
});
