"use client";

import { Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/use-pwa-install";

export function PwaInstallCard() {
  const { deferred, ios, promptInstall, standalone } = usePwaInstall();

  if (standalone) {
    return (
      <div className="rounded-2xl border border-gray-20 bg-white p-4">
        <p className="text-sm font-semibold text-gray-100">Installed on this device</p>
        <p className="mt-0.5 text-xs text-gray-60">
          Alavo is already on your home screen.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-20 bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-30 text-primary-100">
          <Download className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-100">Install Alavo</p>
          {ios && !deferred ? (
            <p className="mt-0.5 text-xs text-gray-60">
              Tap Share <Share className="inline h-3 w-3" /> then Add to Home Screen.
            </p>
          ) : deferred ? (
            <p className="mt-0.5 text-xs text-gray-60">
              Add Alavo to your home screen for faster access.
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-gray-60">
              Use the browser menu → Install app / Add to Home screen.
            </p>
          )}
        </div>
      </div>
      {deferred ? (
        <Button className="mt-3 w-full" onClick={() => void promptInstall()}>
          <Download className="h-4 w-4" />
          Install app
        </Button>
      ) : null}
    </div>
  );
}
