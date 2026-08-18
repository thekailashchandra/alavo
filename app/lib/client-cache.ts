const MEMORY = new Map<string, unknown>();
const EPOCH = new Map<string, number>();
const DIRTY = new Set<string>();
const PREFIX = "alavo_cache_v1:";
const INFLIGHT = new Map<string, Promise<unknown>>();

export const cacheKeys = {
  user: "user",
  today: (date: string) => `today:${date}`,
  habits: "habits",
  journal: "journal",
  analytics: "analytics",
  billing: "billing",
  coaching: "coaching",
  groups: "groups",
} as const;

function storageKey(key: string) {
  return `${PREFIX}${key}`;
}

export function readCache<T>(key: string): T | null {
  if (MEMORY.has(key)) {
    return MEMORY.get(key) as T;
  }
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as T;
    MEMORY.set(key, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T, opts?: { user?: boolean }) {
  MEMORY.set(key, data);
  EPOCH.set(key, Date.now());
  if (opts?.user) DIRTY.add(key);
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(storageKey(key), JSON.stringify(data));
  } catch {
    // Quota or private mode — memory cache still works.
  }
}

export function clearDirty(key: string) {
  DIRTY.delete(key);
}

export function isDirty(key: string) {
  return DIRTY.has(key);
}

export function invalidateCache(prefix?: string) {
  if (!prefix) {
    MEMORY.clear();
    EPOCH.clear();
    DIRTY.clear();
    INFLIGHT.clear();
    if (typeof window !== "undefined") {
      const keys: string[] = [];
      for (let i = 0; i < sessionStorage.length; i += 1) {
        const k = sessionStorage.key(i);
        if (k?.startsWith(PREFIX)) keys.push(k);
      }
      keys.forEach((k) => sessionStorage.removeItem(k));
    }
    return;
  }

  for (const key of Array.from(MEMORY.keys())) {
    if (key === prefix || key.startsWith(prefix)) {
      MEMORY.delete(key);
      EPOCH.delete(key);
      DIRTY.delete(key);
    }
  }
  for (const key of Array.from(INFLIGHT.keys())) {
    if (key === prefix || key.startsWith(prefix)) INFLIGHT.delete(key);
  }
  if (typeof window !== "undefined") {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(storageKey(prefix))) keys.push(k);
    }
    keys.forEach((k) => sessionStorage.removeItem(k));
  }
}

export async function fetchCached<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const existing = INFLIGHT.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const started = Date.now();
  const pending = fetcher()
    .then((data) => {
      if (DIRTY.has(key)) {
        return (readCache<T>(key) as T) ?? data;
      }
      const mutatedAt = EPOCH.get(key) ?? 0;
      if (mutatedAt > started) {
        return (readCache<T>(key) as T) ?? data;
      }
      writeCache(key, data);
      return data;
    })
    .finally(() => {
      INFLIGHT.delete(key);
    });

  INFLIGHT.set(key, pending);
  return pending;
}
