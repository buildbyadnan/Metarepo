"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "@/lib/api";
import { API_ENDPOINTS } from "@repo/api-endpoints";

type User = {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  createdAt?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const data = await apiFetch<{ user: User }>(API_ENDPOINTS.auth.me);
      setUser(data.user);
      setError(null);
    } catch (err) {
      setUser(null);
      // A 401 means "not logged in" — that is not an error state, just unauthenticated.
      // Only surface an error for unexpected failures (5xx, network, etc.)
      const message = err instanceof Error ? err.message : "";
      if (message.includes("401")) {
        setError(null);
      } else {
        setError(message || "Could not reach auth server");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(() => {
    window.location.href = `${process.env.NEXT_PUBLIC_SERVER_URL}${API_ENDPOINTS.auth.google}`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch(API_ENDPOINTS.auth.logout, { method: "POST" });
    } catch {
      // Silent fail — user will be logged out locally regardless
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, login, logout, refreshUser: fetchUser }),
    [user, loading, error, login, logout, fetchUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
