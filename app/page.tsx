"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Flame, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.emailVerified) {
      router.replace("/today");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="phone-shell flex min-h-[100dvh] items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (user?.emailVerified) {
    return null;
  }

  return (
    <div className="phone-shell flex min-h-[100dvh] flex-col">
      <div className="flex flex-1 flex-col justify-between px-6 py-10">
        <div className="space-y-8 pt-8">
          <div className="space-y-3">
            <BrandLogo priority className="max-w-[240px]" />
            <h1 className="sr-only">Alavo</h1>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Build habits that stick
            </div>
            <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
              A calm space to track daily habits, celebrate streaks, and reflect
              on what matters — designed for your phone.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              "Check off today’s habits in seconds",
              "See streaks and patterns at a glance",
              "Journal wins, stress, and tomorrow’s focus",
            ].map((text) => (
              <div
                key={text}
                className="flex items-start gap-3 rounded-2xl border border-border bg-white/80 p-4"
              >
                <Flame className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm text-zinc-700">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 pb-4">
          <Button asChild className="h-12 w-full text-base">
            <Link href="/signup">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 w-full text-base">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
