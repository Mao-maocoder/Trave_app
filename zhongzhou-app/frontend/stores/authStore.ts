import { create } from "zustand";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  authReady: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  authReady: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isLoading: false, error: data.error });
        return false;
      }
      if (data.token) localStorage.setItem("auth_token", data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return true;
    } catch {
      set({ isLoading: false, error: "网络错误，请稍后重试" });
      return false;
    }
  },

  register: async (username, email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isLoading: false, error: data.error });
        return false;
      }
      if (data.token) localStorage.setItem("auth_token", data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return true;
    } catch {
      set({ isLoading: false, error: "网络错误，请稍后重试" });
      return false;
    }
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("auth_token");
    set({ user: null, token: null, error: null });
  },

  initAuth: async () => {
    try {
      const savedToken = localStorage.getItem("auth_token");
      if (!savedToken) {
        set({ authReady: true });
        return;
      }
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      if (!res.ok) {
        localStorage.removeItem("auth_token");
        set({ authReady: true });
        return;
      }
      const data = await res.json();
      if (data.user && data.token) {
        set({ user: data.user, token: data.token });
      }
    } catch {
      // ignore
    } finally {
      set({ authReady: true });
    }
  },

  updateUser: (user) => set({ user }),
  clearError: () => set({ error: null }),
}));
