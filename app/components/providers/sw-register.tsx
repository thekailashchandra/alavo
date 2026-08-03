"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let cancelled = false;

    (async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((reg) => reg.update()));

        const reg = await navigator.serviceWorker.register("/sw.js");
        if (cancelled) return;

        // Prefer the waiting worker immediately after auth migrations
        if (reg.waiting) {
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      } catch (err) {
        console.warn("Service worker registration failed:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
