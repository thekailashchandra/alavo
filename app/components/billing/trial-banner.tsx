"use client";

import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

export function TrialBanner() {
  const { user } = useAuth();
  const billing = user?.billing;
  if (!billing || billing.status !== "trial" || !billing.trialEndsAt) return null;

  const daysLeft = Math.max(
    0,
    differenceInCalendarDays(new Date(billing.trialEndsAt), new Date())
  );

  return (
    <Link
      href="/settings/subscription"
      className="mx-5 mt-4 flex items-center gap-3 rounded-2xl border border-primary-30 bg-gradient-to-r from-primary-20 to-white px-4 py-3"
    >
      <Sparkles className="h-4 w-4 shrink-0 text-primary-100" />
      <span className="min-w-0 text-sm text-gray-100">
        <span className="font-semibold">Pro trial</span>
        <span className="text-gray-60">
          {" "}
          · {daysLeft} day{daysLeft === 1 ? "" : "s"} left · keep unlimited habits
          after
        </span>
      </span>
    </Link>
  );
}
