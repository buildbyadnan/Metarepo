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
import { apiFetch, ApiError } from "@/lib/api";
import { SERVER_URL } from "@/config/server";
import { API_ENDPOINTS } from "@repo/api-endpoints";

type User = {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  notifyUpdates: boolean;
  createdAt?: string;
};

type AuthSnapshot = {
  user: User;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  /**
   * Persists the "latest updates or releases" preference. Optimistic: the
   * UI flips immediately and rolls back if the server rejects the change.
   * Resolves false when the save failed.
   */
  setNotifyUpdates: (value: boolean) => Promise<boolean>;
  /** Re-fetches /auth/me and returns the fresh snapshot (null when signed out/unreachable). */
  refreshUser: () => Promise<AuthSnapshot | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async (): Promise<AuthSnapshot | null> => {
    try {
      const data = await apiFetch<{ user: User }>(API_ENDPOINTS.auth.me);
      const snapshot: AuthSnapshot = { user: data.user };
      setUser(snapshot.user);
      setError(null);
      return snapshot;
    } catch (err) {
      setUser(null);
      // A 401 means "not logged in" — that is not an error state, just unauthenticated.
      // Only surface an error for unexpected failures (5xx, network, etc.)
      if (err instanceof ApiError && err.status === 401) {
        setError(null);
      } else {
        setError((err instanceof Error && err.message) || "Could not reach auth server");
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(() => {
    window.location.href = `${SERVER_URL}${API_ENDPOINTS.auth.google}`;
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

  const setNotifyUpdates = useCallback(
    async (value: boolean): Promise<boolean> => {
      const previous = user;
      if (previous) {
        setUser({ ...previous, notifyUpdates: value });
      }

      try {
        await apiFetch(API_ENDPOINTS.auth.me, {
          method: "PATCH",
          body: JSON.stringify({ notifyUpdates: value }),
        });
        return true;
      } catch {
        if (previous) setUser(previous);
        return false;
      }
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      logout,
      setNotifyUpdates,
      refreshUser: fetchUser,
    }),
    [user, loading, error, login, logout, setNotifyUpdates, fetchUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
