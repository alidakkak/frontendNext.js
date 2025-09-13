'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'ADMIN' | 'PUBLISHER' | 'SUBSCRIBER';
export type AuthUser = { id: string; email: string; name?: string | null; role: Role };

type State = {
  user: AuthUser | null;
  token: string | null;
  // actions
  login: (payload: { token: string; user: AuthUser }) => void;
  logout: () => void;
  hardReset: () => void;
};

const LEGACY_KEYS = ['auth_token', 'auth_user'];

export const useAuth = create<State>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: ({ token, user }) => {
        try {
          for (const k of LEGACY_KEYS) localStorage.removeItem(k);
        } catch {}
        set({ token, user });
      },

      logout: () => {
        set({ token: null, user: null });
        try {
          localStorage.removeItem('auth'); // اسم persist
          for (const k of LEGACY_KEYS) localStorage.removeItem(k);
        } catch {}
      },

      hardReset: () => {
        set({ token: null, user: null });
        try {
          localStorage.removeItem('auth');
          for (const k of LEGACY_KEYS) localStorage.removeItem(k);
        } catch {}
      },
    }),
    {
      name: 'auth',
      version: 1,
      partialize: (s) => ({ user: s.user, token: s.token }),
    },
  ),
);
