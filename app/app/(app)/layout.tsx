"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { PrefetchProvider } from "@/components/providers/prefetch-provider";
import { AppShell } from "@/components/layout/app-shell";
import { ConsentGate } from "@/components/compliance/consent-gate";
import { TrialBanner } from "@/components/billing/trial-banner";
import type { PrivacyConsentRecord } from "@/lib/compliance/consent";
import { parseAccountSettings } from "@/lib/account-settings";
import { useTheme } from "@/components/providers/theme-provider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { setTheme } = useTheme();

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

  return (
    <AppShell>
      <PrefetchProvider />
      <TrialBanner />
      {children}
      <ConsentGate
        privacyConsent={user.privacyConsent as PrivacyConsentRecord | null}
      />
    </AppShell>
  );
}
