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
import { createClient } from "@/lib/supabase/client";
import { getTimezone, parseJson, type User } from "@/lib/api-client";
import { signOutAction } from "@/lib/auth/actions";

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string
  ) => Promise<{ needsVerification: boolean; verifyUrl?: string; message?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<string | null>;
  fetchWithAuth: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (!res.ok) {
      setUser(null);
      return null;
    }
    const me = await parseJson<User>(res);
    setUser(me);
    return me;
  }, []);

  const refresh = useCallback(async () => {
    const me = await loadMe();
    return me ? "session" : null;
  }, [loadMe]);

  const fetchWithAuth = useCallback(
    async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const headers = new Headers(init.headers);
      let res = await fetch(input, {
        ...init,
        headers,
        credentials: "include",
      });

      if (res.status === 401) {
        const supabase = createClient();
        await supabase.auth.getSession();
        res = await fetch(input, {
          ...init,
          headers,
          credentials: "include",
        });
      }

      return res;
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const timezone = getTimezone();
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw new Error(error.message || "Failed to sign in");
      }

      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut();
        setUser(null);
        throw new Error("Please verify your email before signing in");
      }

      await fetch("/api/auth/bootstrap", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone }),
      }).catch(() => null);

      const me = await loadMe();
      if (!me) throw new Error("Signed in but could not load profile");
      if (!me.emailVerified) {
        await supabase.auth.signOut();
        setUser(null);
        throw new Error("Please verify your email before signing in");
      }
    },
    [loadMe]
  );

  const signup = useCallback(
    async (email: string, password: string) => {
      const supabase = createClient();
      const name = email.split("@")[0] || "Alavo user";
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        throw new Error(error.message || "Failed to create account");
      }

      if (data.user?.email_confirmed_at && data.session) {
        await fetch("/api/auth/bootstrap", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timezone: getTimezone() }),
        }).catch(() => null);
        await loadMe();
        return {
          needsVerification: false,
          message: "Account created.",
        };
      }

      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
      setUser(null);

      return {
        needsVerification: true,
        message: "Account created. Check your email to verify, then sign in.",
      };
    },
    [loadMe]
  );

  const logout = useCallback(async () => {
    try {
      await signOutAction();
    } catch {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadMe();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadMe]);

  const value = useMemo(
    () => ({
      user,
      accessToken: user ? "session" : null,
      loading,
      login,
      signup,
      logout,
      refresh,
      fetchWithAuth,
      setUser,
    }),
    [user, loading, login, signup, logout, refresh, fetchWithAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
