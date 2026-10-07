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

export default function AppClientLayout({
  children,
  blocked = false,
}: {
  children: React.ReactNode;
  blocked?: boolean;
}) {
  const { user, loading, fetchWithAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const [cloudAccess, setCloudAccess] = useState<boolean | null>(blocked ? false : null);

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
        const json = (await res.json().catch(() => ({}))) as { cloudAccess?: boolean };
        if (cancelled) return;
        if (!res.ok) {
          setCloudAccess(blocked ? false : true);
          return;
        }
        setCloudAccess(json.cloudAccess === true);
      })
      .catch(() => {
        if (!cancelled) setCloudAccess(blocked ? false : true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, pathname, fetchWithAuth, blocked]);

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
  const showPaywall = !accountPage && (blocked || cloudAccess === false);
  const waiting = !accountPage && !showPaywall && cloudAccess === null;

  return (
    <AppShell>
      {showPaywall || waiting ? null : <PrefetchProvider />}
      {showPaywall || waiting ? null : <TrialBanner />}
      {waiting ? (
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
