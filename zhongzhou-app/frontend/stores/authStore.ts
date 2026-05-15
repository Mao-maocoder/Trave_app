import { create } from "zustand";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  initAuth: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
}

const storage = typeof window !== "undefined" ? localStorage : null;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
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
      storage?.setItem("token", data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return true;
    } catch {
      set({ isLoading: false, error: "网络错误，请稍后重试" });
      return false;
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        set({ isLoading: false, error: data.error });
        return false;
      }
      storage?.setItem("token", data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return true;
    } catch {
      set({ isLoading: false, error: "网络错误，请稍后重试" });
      return false;
    }
  },

  logout: () => {
    storage?.removeItem("token");
    set({ user: null, token: null, error: null });
  },

  updateUser: (user) => {
    set({ user });
  },

  initAuth: async () => {
    const token = storage?.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        storage?.removeItem("token");
        return;
      }
      const data = await res.json();
      set({ user: data.user, token });
    } catch {
      storage?.removeItem("token");
    }
  },

  clearError: () => set({ error: null }),
}));
