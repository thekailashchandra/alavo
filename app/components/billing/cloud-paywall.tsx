"use client";

import Link from "next/link";
import { formatMoney, intervalSuffix } from "@alavo/brand";
import { Button } from "@/components/ui/button";
import { useCheckout } from "@/hooks/use-checkout";
import { useBillingMarket } from "@/hooks/use-billing-market";
import { useLiveCatalog } from "@/hooks/use-live-catalog";

const MARKETING_URL = "https://alavo.cc";
const GITHUB_URL = "https://github.com/thekailashchandra/alavo";

export function CloudPaywall() {
  const { checkout, pendingSku } = useCheckout();
  const market = useBillingMarket();
  const catalog = useLiveCatalog(market);
  const monthly = catalog.packages.find((pkg) => pkg.sku === "PRO_MONTHLY");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 py-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-100">
          Alavo Cloud is a paid service
        </h1>
        <p className="text-sm leading-relaxed text-gray-60">
          Alavo is open source and free to self-host. Alavo Cloud is the managed
          version, with hosting and updates handled for you. The same account
          works across your devices.
        </p>
      </div>

      <section className="rounded-2xl border border-primary-30 bg-primary-20/40 p-5">
        <p className="text-sm font-semibold text-gray-100">Alavo Cloud</p>
        <p className="mt-2 text-2xl font-semibold text-primary-100">
          {monthly
            ? `${formatMoney(monthly.amount, monthly.currency)}${intervalSuffix(monthly.interval)}`
            : "Monthly plan"}
        </p>
        <ul className="mt-3 space-y-1 text-sm text-gray-60">
          <li>Hosted app and database</li>
          <li>Unlimited habits, full history, and analytics</li>
          <li>Reminders on the hosted app</li>
        </ul>
        <Button
          className="mt-4 w-full"
          disabled={!monthly || pendingSku != null}
          onClick={() => {
            if (!monthly) return;
            void checkout("PRO_MONTHLY", undefined, market);
          }}
        >
          {pendingSku === "PRO_MONTHLY" ? "Redirecting…" : "Get Alavo Cloud"}
        </Button>
      </section>

      <section className="rounded-2xl border border-gray-20 bg-card p-5">
        <p className="text-sm font-semibold text-gray-100">Prefer not to pay for hosting?</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-60">
          Run Alavo yourself for free. Self-hosting includes the full habit tracker.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`${MARKETING_URL}/self-host`}>Self-host for free</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href={GITHUB_URL}>View on GitHub</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
