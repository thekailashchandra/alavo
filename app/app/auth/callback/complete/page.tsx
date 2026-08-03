"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { getTimezone } from "@/lib/api-client";
import { BrandLogo } from "@/components/brand-logo";

function AuthCallbackCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user?.email) {
          throw new Error(error?.message || "Sign-in did not complete");
        }

        const providerParam = searchParams.get("provider");
        await fetch("/api/auth/bootstrap", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            timezone: getTimezone(),
            provider:
              providerParam === "google" ||
              data.user.app_metadata?.provider === "google"
                ? "GOOGLE"
                : undefined,
          }),
        }).catch(() => null);

        toast.success(
          searchParams.get("new") === "1" ? "Welcome to Alavo" : "Signed in"
        );
        router.replace("/today");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Social sign-in failed"
        );
        router.replace("/login?error=oauth");
      }
    })();
  }, [router, searchParams]);

  return (
    <div className="phone-shell flex min-h-dvh flex-col items-center justify-center gap-4 px-6">
      <BrandLogo className="max-w-40" />
      <p className="text-sm text-muted-foreground">Finishing sign-in…</p>
      <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
    </div>
  );
}

export default function AuthCallbackCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="phone-shell flex min-h-dvh items-center justify-center">
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        </div>
      }
    >
      <AuthCallbackCompleteContent />
    </Suspense>
  );
}
