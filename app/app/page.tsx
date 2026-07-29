"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
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
      <div className="phone-shell flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (user?.emailVerified) {
    return null;
  }

  return (
    <div className="phone-shell flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col justify-between px-6 py-10">
        <div className="space-y-6 pt-6">
          <BrandLogo priority className="max-w-[180px]" />
          <div className="space-y-3">
            <h1 className="brand-title text-4xl font-semibold tracking-tight text-foreground">
              Alavo
            </h1>
            <p className="text-lg font-medium leading-snug text-foreground">
              Alavo is a habit tracking app for building daily routines, keeping
              streaks, and reflecting in a simple journal.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              With Alavo you can create habits, mark them complete each day,
              track consistency, and write short reflections. When you continue
              with Google, Alavo uses your Google account name and email only to
              create and sign you into your Alavo account. We do not sell your
              data. See our{" "}
              <a
                href="https://alavo.cc/privacy"
                className="font-medium text-primary underline underline-offset-2"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://alavo.cc/terms"
                className="font-medium text-primary underline underline-offset-2"
              >
                Terms of Service
              </a>
              .
            </p>
          </div>
        </div>

        <div className="space-y-3 pb-4">
          <Button asChild className="h-12 w-full text-base">
            <Link href="/signup">
              Start free with Alavo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 w-full text-base">
            <Link href="/login">Sign in to Alavo</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
