"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { AppShell } from "@/components/layout/app-shell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const retried = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!user && !retried.current) {
      retried.current = true;
      void refresh().then((ok) => {
        if (!ok) router.replace("/login");
      });
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!user.emailVerified) {
      router.replace(`/verify-email?email=${encodeURIComponent(user.email)}`);
    }
  }, [user, loading, router, refresh]);

  if (loading) {
    return (
      <div className="phone-shell flex min-h-[100dvh] items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (!user?.emailVerified) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
