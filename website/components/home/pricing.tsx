"use client";

import type { ReactNode } from "react";
import { formatMoney, intervalSuffix } from "@alavo/brand";
import Link from "next/link";
import { useBillingMarket } from "@/lib/use-billing-market";
import { useLiveCatalog } from "@/lib/use-live-catalog";

const appUrl = (
  process.env.NEXT_PUBLIC_PRODUCT_URL || "https://app.alavo.cc"
).replace(/\/$/, "");

const GITHUB_URL = "https://github.com/thekailashchandra/alavo";

function PlanCard({
  title,
  price,
  hint,
  features,
  highlight,
  action,
}: {
  title: string;
  price: ReactNode;
  hint: string;
  features: readonly string[];
  highlight?: boolean;
  action: ReactNode;
}) {
  return (
    <article
      className={
        highlight
          ? "flex flex-col rounded-[1.35rem] border border-[var(--alavo-primary)] bg-[linear-gradient(180deg,rgba(123,8,224,0.08),var(--alavo-surface))] p-6 shadow-[0_24px_60px_-40px_rgba(123,8,224,0.45)]"
          : "flex flex-col rounded-[1.35rem] border border-[var(--alavo-gray-20)] bg-[color-mix(in_srgb,var(--alavo-surface)_80%,transparent)] p-6"
      }
    >
      <p className="text-sm font-semibold text-[var(--alavo-primary)]">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">{price}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{hint}</p>
      <ul className="mt-4 space-y-2 text-sm text-[var(--foreground)]">
        {features.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <div className="mt-6">{action}</div>
    </article>
  );
}

export function PricingSection() {
  const market = useBillingMarket();
  const catalog = useLiveCatalog(market);
  const monthly = catalog.packages.find((pkg) => pkg.sku === "PRO_MONTHLY");
  const others = catalog.packages.filter((pkg) => pkg.sku !== "PRO_MONTHLY");

  return (
    <section id="pricing" className="px-6 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <span className="section-label">Pricing</span>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
          Free to self-host. Paid when we host it.
        </h2>
        <p className="mt-3 max-w-2xl text-base text-[var(--muted)]">
          The software is free. Alavo Cloud is managed hosting. Existing Cloud
          accounts keep the access they already have.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <PlanCard
            title="Self-hosted"
            price="Free forever"
            hint="Run Alavo yourself."
            features={[
              "Full open-source application",
              "Unlimited habits",
              "Full history and analytics",
              "Data export",
              "Your database and server",
              "Community support",
            ]}
            action={
              <Link href="/self-host" className="btn-secondary inline-flex h-12 items-center px-6 text-sm">
                Self-host for free
              </Link>
            }
          />
          <PlanCard
            title="Alavo Cloud"
            price={
              monthly ? (
                <>
                  {formatMoney(monthly.amount, monthly.currency)}
                  <span className="text-base font-medium text-[var(--muted)]">
                    {intervalSuffix(monthly.interval)}
                  </span>
                </>
              ) : (
                "Paid"
              )
            }
            hint="Don't want to manage servers? We'll host it."
            highlight
            features={[
              "Managed hosting",
              "Hosted database",
              "Same account on your devices",
              "Reminders on the hosted app",
              "Unlimited habits and full history",
              "Analytics from your own check-ins",
            ]}
            action={
              <Link href={`${appUrl}/signup`} className="btn-primary inline-flex h-12 items-center px-6 text-sm">
                Get Alavo Cloud
              </Link>
            }
          />
        </div>

        {others.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {others.map((pkg) => (
              <article
                key={pkg.sku}
                className="rounded-[1.35rem] border border-[var(--alavo-gray-20)] p-5"
              >
                <p className="text-sm font-semibold text-[var(--foreground)]">{pkg.name}</p>
                <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                  {formatMoney(pkg.amount, pkg.currency)}
                  {intervalSuffix(pkg.interval)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">{pkg.hint}</p>
              </article>
            ))}
          </div>
        ) : null}

        <div className="mt-8">
          <Link href={GITHUB_URL} className="text-sm font-semibold text-[var(--alavo-primary)]">
            View on GitHub
          </Link>
        </div>
      </div>
    </section>
  );
}
