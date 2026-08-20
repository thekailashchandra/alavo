"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { isInstallDismissed, isMobileDevice } from "@/lib/pwa-install";

export function PwaInstallPrompt() {
  const pathname = usePathname();
  const { canInstall, deferred, dismiss, ios, promptInstall, standalone } =
    usePwaInstall();
  const [visible, setVisible] = useState(false);
  const [aboveNav, setAboveNav] = useState(false);

  useEffect(() => {
    setAboveNav(Boolean(document.querySelector(".bottom-nav")));
  }, [pathname]);

  useEffect(() => {
    if (standalone || isInstallDismissed()) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => {
      if (canInstall || ios || isMobileDevice()) setVisible(true);
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [canInstall, ios, standalone]);

  if (!visible || standalone) return null;

  const onDismiss = () => {
    dismiss();
    setVisible(false);
  };

  const onInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) setVisible(false);
  };

  return (
    <div
      className="pwa-install-banner pointer-events-none"
      data-above-nav={aboveNav ? "true" : "false"}
    >
      <div className="pointer-events-auto w-full rounded-2xl border border-border bg-card/95 p-3 shadow-[0_12px_32px_rgba(17,17,17,0.12)] backdrop-blur-md">
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="" className="h-10 w-10 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Install Alavo</p>
            {ios && !deferred ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Tap Share <Share className="inline h-3 w-3" /> then{" "}
                <span className="font-medium">Add to Home Screen</span>.
              </p>
            ) : deferred ? (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add it to your home screen for a full-screen app.
              </p>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Open the browser menu and tap{" "}
                <span className="font-medium">Install app</span> or{" "}
                <span className="font-medium">Add to Home screen</span>.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg p-1 text-zinc-400"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {deferred ? (
          <Button className="mt-3 w-full" onClick={() => void onInstall()}>
            <Download className="h-4 w-4" />
            Install app
          </Button>
        ) : null}
      </div>
    </div>
  );
}
