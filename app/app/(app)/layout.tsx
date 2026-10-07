"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { PrefetchProvider } from "@/components/providers/prefetch-provider";
import { AppShell } from "@/components/layout/app-shell";
import { ConsentGate } from "@/components/compliance/consent-gate";
import { TrialBanner } from "@/components/billing/trial-banner";
import { CloudPaywall } from "@/components/billing/cloud-paywall";
import type { PrivacyConsentRecord } from "@/lib/compliance/consent";
import { parseAccountSettings } from "@/lib/account-settings";
import { useTheme } from "@/components/providers/theme-provider";

const ACCOUNT_PATHS = [
  "/settings/subscription",
  "/settings/profile",
  "/settings/preferences",
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, fetchWithAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const [cloudAccess, setCloudAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!user.emailVerified) {
      router.replace(`/verify-email?email=${encodeURIComponent(user.email)}`);
    }
  }, [user, loading, router]);

  useEffect(() => {
    const theme = parseAccountSettings(user?.accountSettings).theme ?? "indigo";
    setTheme(theme);
  }, [user?.accountSettings, setTheme]);

  useEffect(() => {
    if (!user?.emailVerified) return;
    let cancelled = false;
    void fetchWithAuth("/api/billing/entitlements")
      .then(async (res) => {
        const json = (await res.json()) as { cloudAccess?: boolean };
        if (!cancelled) setCloudAccess(json.cloudAccess !== false);
      })
      .catch(() => {
        if (!cancelled) setCloudAccess(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, pathname, fetchWithAuth]);

  if (loading && !user) {
    return (
      <div className="phone-shell flex items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (!user?.emailVerified) {
    return (
      <div className="phone-shell flex items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  const accountPage = ACCOUNT_PATHS.some((path) => pathname.startsWith(path));
  const showPaywall = cloudAccess === false && !accountPage;

  return (
    <AppShell>
      {showPaywall ? null : <PrefetchProvider />}
      {showPaywall ? null : <TrialBanner />}
      {cloudAccess === null ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        </div>
      ) : showPaywall ? (
        <CloudPaywall />
      ) : (
        children
      )}
      <ConsentGate
        privacyConsent={user.privacyConsent as PrivacyConsentRecord | null}
      />
    </AppShell>
  );
}
