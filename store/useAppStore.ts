import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { IntakeDraft, UserSession, DashboardData } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const SESSION_KEY = 'shahr_user_session';
const DRAFT_KEY = 'shahr_intake_draft';

// ─── Store Shape ─────────────────────────────────────────────────────────────

interface AppStore {
  // Session
  session: UserSession | null;
  sessionLoaded: boolean;
  setSession: (session: UserSession) => Promise<void>;
  clearSession: () => Promise<void>;
  loadSession: () => Promise<void>;

  // Intake
  intakeDraft: Partial<IntakeDraft>;
  updateDraft: (patch: Partial<IntakeDraft>) => void;
  clearDraft: () => void;

  // Current booking ID after submission
  currentBookingId: string | null;
  setCurrentBookingId: (id: string) => void;

  // Dashboard cache
  dashboardData: DashboardData | null;
  setDashboardData: (data: DashboardData) => void;
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
    await SecureStore.deleteItemAsync(DRAFT_KEY);
    set({ session: null, intakeDraft: {}, currentBookingId: null, dashboardData: null });
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

  // ── Intake Draft ─────────────────────────────────────────────────────────
  intakeDraft: {},

  updateDraft: (patch) => {
    const merged = { ...get().intakeDraft, ...patch };
    set({ intakeDraft: merged });
  },

  clearDraft: () => set({ intakeDraft: {} }),

  // ── Booking ──────────────────────────────────────────────────────────────
  currentBookingId: null,
  setCurrentBookingId: (id) => set({ currentBookingId: id }),

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboardData: null,
  setDashboardData: (data) => set({ dashboardData: data }),
}));
