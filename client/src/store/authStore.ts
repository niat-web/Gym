import { create } from 'zustand';
import { User, UserRole } from '../types/index.js';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (tokens: { accessToken: string; refreshToken: string }, user: User) => void;
  setTokens: (accessToken: string, refreshToken: string, user?: User) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

const STORAGE_KEY_AUTH = 'fitcore_auth';

const loadInitialState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.accessToken && parsed.user) {
        return {
          user: parsed.user,
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken,
          isAuthenticated: true,
          role: parsed.user.role as UserRole,
        };
      }
    }
  } catch (e) {
    console.error('Failed to load auth from storage', e);
  }
  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    role: null,
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  ...loadInitialState(),

  login: (tokens, user) => {
    localStorage.setItem(
      STORAGE_KEY_AUTH,
      JSON.stringify({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      })
    );
    set({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      isAuthenticated: true,
      role: user.role,
    });
  },

  setTokens: (accessToken, refreshToken, user) => {
    set((state) => {
      const updatedUser = user || state.user;
      localStorage.setItem(
        STORAGE_KEY_AUTH,
        JSON.stringify({
          accessToken,
          refreshToken,
          user: updatedUser,
        })
      );
      return {
        accessToken,
        refreshToken,
        user: updatedUser,
        isAuthenticated: !!updatedUser,
        role: updatedUser?.role || null,
      };
    });
  },

  updateUser: (partial) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...partial };
      localStorage.setItem(
        STORAGE_KEY_AUTH,
        JSON.stringify({
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          user: updated,
        })
      );
      return { user: updated };
    });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_AUTH);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      role: null,
    });
  },
}));
