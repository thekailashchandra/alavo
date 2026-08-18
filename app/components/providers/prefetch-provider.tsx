"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { parseJson } from "@/lib/api-client";
import { cacheKeys, fetchCached, readCache } from "@/lib/client-cache";
import { getTodayInTimezone } from "@/lib/habits";

export function PrefetchProvider() {
  const { user, fetchWithAuth } = useAuth();

  useEffect(() => {
    if (!user) return;

    const date = getTodayInTimezone(user.timezone);
    const jobs: Array<[string, string]> = [
      [cacheKeys.today(date), `/api/habits/today?date=${date}`],
      [cacheKeys.habits, "/api/habits"],
      [cacheKeys.journal, "/api/journal"],
      [cacheKeys.analytics, "/api/analytics"],
    ];

    const run = () => {
      for (const [key, url] of jobs) {
        if (readCache(key)) continue;
        void fetchCached(key, async () => {
          const res = await fetchWithAuth(url);
          return parseJson(res);
        }).catch(() => null);
      }
    };

    const idleId = window.setTimeout(run, 120);

    return () => {
      window.clearTimeout(idleId);
    };
  }, [user, fetchWithAuth]);

  return null;
}
