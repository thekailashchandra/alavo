"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { parseJson } from "@/lib/api-client";
import { fetchCached, isDirty, readCache, writeCache } from "@/lib/client-cache";
import { useAuth } from "@/components/providers/auth-provider";

export function useCachedQuery<T>(key: string | null, url: string | null) {
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useLayoutEffect(() => {
    if (!key) return;
    const cached = readCache<T>(key);
    if (cached) {
      setData(cached);
      setLoading(false);
    } else {
      setData(null);
      setLoading(true);
    }
  }, [key]);

  const reload = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!key || !url) return null;
      if (!opts?.silent && !readCache<T>(key)) {
        setLoading(true);
      }
      setError(false);
      try {
        const next = await fetchCached(key, async () => {
          const res = await fetchWithAuth(url);
          return parseJson<T>(res);
        });
        if (key && isDirty(key)) {
          const local = readCache<T>(key);
          if (local) setData(local);
          else setData(next);
        } else {
          setData(next);
        }
        return next;
      } catch {
        setError(true);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [key, url, fetchWithAuth]
  );

  useEffect(() => {
    if (!key || !url) return;
    void reload({ silent: true });
  }, [key, url, reload]);

  const setCachedData = useCallback(
    (next: T | ((prev: T | null) => T)) => {
      setData((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T | null) => T)(prev) : next;
        if (key) writeCache(key, resolved, { user: true });
        return resolved;
      });
    },
    [key]
  );

  return { data, loading, error, reload, setCachedData };
}
