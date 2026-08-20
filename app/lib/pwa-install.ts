export const PWA_DISMISS_KEY = "alavo_pwa_dismissed_at";
export const PWA_DISMISS_MS = 14 * 24 * 60 * 60 * 1000;

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __alavoPwa?: {
      deferred: BeforeInstallPromptEvent | null;
    };
  }
}

/** Capture the install event before React hydrates — Chrome often fires it once, early. */
export const PWA_INSTALL_BOOTSTRAP_SCRIPT = `try{window.__alavoPwa=window.__alavoPwa||{deferred:null};window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__alavoPwa.deferred=e;window.dispatchEvent(new Event("alavo-pwa-prompt"));});window.addEventListener("appinstalled",function(){window.__alavoPwa.deferred=null;window.dispatchEvent(new Event("alavo-pwa-installed"));});}catch(e){}`;

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS = /iphone|ipad|ipod/i.test(ua);
  const iPadOs =
    window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
  return iOS || iPadOs;
}

export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  if (isIosDevice()) return true;
  if (/android|mobile|mobi|webos|opera mini/i.test(window.navigator.userAgent)) {
    return true;
  }
  return window.matchMedia("(max-width: 768px)").matches;
}

export function readDeferredPrompt(): BeforeInstallPromptEvent | null {
  if (typeof window === "undefined") return null;
  return window.__alavoPwa?.deferred ?? null;
}

export function clearDeferredPrompt() {
  if (typeof window === "undefined") return;
  if (window.__alavoPwa) window.__alavoPwa.deferred = null;
}

export function isInstallDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    // Old builds stored a permanent dismiss. Clear it so the prompt can show again.
    if (localStorage.getItem("alavo_pwa_dismissed") === "1") {
      localStorage.removeItem("alavo_pwa_dismissed");
    }
    const raw = localStorage.getItem(PWA_DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < PWA_DISMISS_MS;
  } catch {
    return false;
  }
}

export function dismissInstallPrompt() {
  try {
    localStorage.setItem(PWA_DISMISS_KEY, String(Date.now()));
    localStorage.removeItem("alavo_pwa_dismissed");
  } catch {
    // ignore
  }
}

export function markInstalled() {
  try {
    localStorage.setItem(PWA_DISMISS_KEY, String(Date.now()));
    localStorage.removeItem("alavo_pwa_dismissed");
  } catch {
    // ignore
  }
  clearDeferredPrompt();
}
