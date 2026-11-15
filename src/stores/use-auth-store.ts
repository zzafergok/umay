import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  lastUnauthorizedAt: number | null;
  setAuth: (user: AuthUser, token: string) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  markUnauthorized: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      lastUnauthorizedAt: null,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          lastUnauthorizedAt: null,
        }),

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
          lastUnauthorizedAt: null,
        }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          lastUnauthorizedAt: null,
        }),

      markUnauthorized: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          lastUnauthorizedAt: Date.now(),
        }),

      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null,
        })),
    }),
    {
      name: 'umay-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
