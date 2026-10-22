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
import { SERVER_URL } from "@/config/server";
import { API_ENDPOINTS } from "@repo/api-endpoints";

type User = {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  createdAt?: string;
};

type AuthSnapshot = {
  user: User;
  waitlisted: boolean;
  waitlistStatus: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  waitlisted: boolean;
  waitlistStatus: string | null;
  login: () => void;
  logout: () => Promise<void>;
  /** Re-fetches /auth/me and returns the fresh snapshot (null when signed out/unreachable). */
  refreshUser: () => Promise<AuthSnapshot | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [waitlisted, setWaitlisted] = useState(false);
  const [waitlistStatus, setWaitlistStatus] = useState<string | null>(null);

  const fetchUser = useCallback(async (): Promise<AuthSnapshot | null> => {
    try {
      const data = await apiFetch<{
        user: User;
        waitlisted?: boolean;
        waitlistStatus?: string | null;
      }>(API_ENDPOINTS.auth.me);
      const snapshot: AuthSnapshot = {
        user: data.user,
        waitlisted: data.waitlisted ?? false,
        waitlistStatus: data.waitlistStatus ?? null,
      };
      setUser(snapshot.user);
      setWaitlisted(snapshot.waitlisted);
      setWaitlistStatus(snapshot.waitlistStatus);
      setError(null);
      return snapshot;
    } catch (err) {
      setUser(null);
      setWaitlisted(false);
      setWaitlistStatus(null);
      // A 401 means "not logged in" — that is not an error state, just unauthenticated.
      // Only surface an error for unexpected failures (5xx, network, etc.)
      const message = err instanceof Error ? err.message : "";
      if (message.includes("401")) {
        setError(null);
      } else {
        setError(message || "Could not reach auth server");
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
      setWaitlisted(false);
      setWaitlistStatus(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      waitlisted,
      waitlistStatus,
      login,
      logout,
      refreshUser: fetchUser,
    }),
    [user, loading, error, waitlisted, waitlistStatus, login, logout, fetchUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
