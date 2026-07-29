"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  OFFLINE_QUEUE_KEY,
  parseJson,
  type HabitLogInput,
  type OfflineLogMutation,
} from "@/lib/api-client";
import { useAuth } from "@/components/providers/auth-provider";

function readQueue(): OfflineLogMutation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OfflineLogMutation[];
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineLogMutation[]) {
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function useOfflineSync() {
  const { fetchWithAuth, user } = useAuth();
  const flushingRef = useRef(false);

  const flushQueue = useCallback(async () => {
    if (flushingRef.current || !navigator.onLine || !user) return;
    const queue = readQueue();
    if (queue.length === 0) return;

    flushingRef.current = true;
    const remaining: OfflineLogMutation[] = [];

    try {
      for (const item of queue) {
        const { queuedAt: _queuedAt, ...payload } = item;
        void _queuedAt;
        const res = await fetchWithAuth("/api/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload satisfies HabitLogInput),
        });

        if (!res.ok) {
          remaining.push(item);
        }
      }

      writeQueue(remaining);

      const synced = queue.length - remaining.length;
      if (synced > 0) {
        toast.success(`Synced ${synced} offline ${synced === 1 ? "change" : "changes"}`);
      }
    } finally {
      flushingRef.current = false;
    }
  }, [fetchWithAuth, user]);

  const queueLog = useCallback(
    async (payload: HabitLogInput) => {
      if (navigator.onLine) {
        const res = await fetchWithAuth("/api/logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        await parseJson(res);
        return { offline: false as const };
      }

      const queue = readQueue();
      const existing = queue.findIndex(
        (q) => q.habitId === payload.habitId && q.date === payload.date
      );
      const entry: OfflineLogMutation = {
        ...payload,
        queuedAt: new Date().toISOString(),
      };

      if (existing >= 0) queue[existing] = entry;
      else queue.push(entry);

      writeQueue(queue);
      toast.info("Saved offline — will sync when back online");
      return { offline: true as const };
    },
    [fetchWithAuth]
  );

  useEffect(() => {
    const handleOnline = () => {
      void flushQueue();
    };

    window.addEventListener("online", handleOnline);
    void flushQueue();

    return () => window.removeEventListener("online", handleOnline);
  }, [flushQueue]);

  return { queueLog, flushQueue, pendingCount: readQueue().length };
}
