"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "alavo_pwa_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIos() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function PwaInstallPrompt() {
  const pathname = usePathname();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);
  const [aboveNav, setAboveNav] = useState(false);

  useEffect(() => {
    setAboveNav(Boolean(document.querySelector(".bottom-nav")));
  }, [pathname]);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY) === "1") return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);

    let timer: number | undefined;
    if (isIos()) {
      timer = window.setTimeout(() => {
        setIosHint(true);
        setVisible(true);
      }, 2500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome !== "dismissed") {
      localStorage.setItem(DISMISS_KEY, "1");
    }
    setDeferred(null);
    setVisible(false);
  };

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-3"
      style={{
        bottom: aboveNav
          ? "calc(var(--app-nav-height) + env(safe-area-inset-bottom, 0px) + 0.75rem)"
          : "calc(1rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="pointer-events-auto w-full max-w-[406px] rounded-2xl border border-border bg-white/95 p-3 shadow-[0_12px_32px_rgba(17,17,17,0.12)] backdrop-blur-md">
        <div className="flex items-start gap-3">
          <img src="/icon-192.png" alt="" className="h-10 w-10 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Install Alavo</p>
            {iosHint && !deferred ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Tap Share <Share className="inline h-3 w-3" /> then{" "}
                <span className="font-medium">Add to Home Screen</span>.
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add it to your home screen for a full-screen app.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg p-1 text-zinc-400"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {deferred ? (
          <Button className="mt-3 w-full" onClick={() => void install()}>
            <Download className="h-4 w-4" />
            Install app
          </Button>
        ) : null}
      </div>
    </div>
  );
}
