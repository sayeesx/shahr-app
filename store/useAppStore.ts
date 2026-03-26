import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { UserSession } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = 'shahr_user_session';

// ─── Store Shape ─────────────────────────────────────────────────────────────

interface AppStore {
  // Session
  session: UserSession | null;
  sessionLoaded: boolean;
  setSession: (session: UserSession) => Promise<void>;
  clearSession: () => Promise<void>;
  loadSession: () => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>((set, get) => ({
  // ── Session ──────────────────────────────────────────────────────────────
  session: null,
  sessionLoaded: false,

  setSession: async (session) => {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    set({ session });
  },

  clearSession: async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    set({ session: null });
  },

  loadSession: async () => {
    try {
      const raw = await SecureStore.getItemAsync(SESSION_KEY);
      const session = raw ? (JSON.parse(raw) as UserSession) : null;
      set({ session, sessionLoaded: true });
    } catch {
      set({ session: null, sessionLoaded: true });
    }
  },
}));
