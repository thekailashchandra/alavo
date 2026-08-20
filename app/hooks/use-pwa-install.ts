"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearDeferredPrompt,
  dismissInstallPrompt,
  isIosDevice,
  isStandalone,
  markInstalled,
  readDeferredPrompt,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa-install";

export function usePwaInstall() {
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setStandalone(isStandalone());
    setIos(isIosDevice());
    setDeferred(readDeferredPrompt());

    const onNativePrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      window.__alavoPwa = window.__alavoPwa ?? { deferred: null };
      window.__alavoPwa.deferred = promptEvent;
      setDeferred(promptEvent);
    };
    const syncPrompt = () => setDeferred(readDeferredPrompt());
    const onInstalled = () => {
      setDeferred(null);
      setStandalone(true);
      markInstalled();
    };

    window.addEventListener("beforeinstallprompt", onNativePrompt);
    window.addEventListener("alavo-pwa-prompt", syncPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("alavo-pwa-installed", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onNativePrompt);
      window.removeEventListener("alavo-pwa-prompt", syncPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("alavo-pwa-installed", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const event = deferred ?? readDeferredPrompt();
    if (!event) return false;
    await event.prompt();
    const choice = await event.userChoice;
    clearDeferredPrompt();
    setDeferred(null);
    if (choice.outcome === "accepted") {
      markInstalled();
      setStandalone(true);
      return true;
    }
    return false;
  }, [deferred]);

  const dismiss = useCallback(() => {
    dismissInstallPrompt();
  }, []);

  return {
    canInstall: Boolean(deferred) && !standalone,
    deferred,
    dismiss,
    ios,
    promptInstall,
    standalone,
  };
}
