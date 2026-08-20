"use client";

import type { ReactNode } from "react";
import { TRIAL_DAYS, formatMoney, intervalSuffix } from "@alavo/brand";
import Link from "next/link";
import { useBillingMarket } from "@/lib/use-billing-market";
import { useLiveCatalog } from "@/lib/use-live-catalog";

const appUrl = (
  process.env.NEXT_PUBLIC_PRODUCT_URL || "https://app.alavo.cc"
).replace(/\/$/, "");

function PlanCard({
  title,
  price,
  hint,
  features,
  highlight,
}: {
  title: string;
  price: ReactNode;
  hint: string;
  features: readonly string[];
  highlight?: boolean;
}) {
  return (
    <article
      className={
        highlight
          ? "rounded-[1.35rem] border border-[var(--alavo-primary)] bg-[linear-gradient(180deg,rgba(123,8,224,0.08),var(--alavo-surface))] p-6 shadow-[0_24px_60px_-40px_rgba(123,8,224,0.45)]"
          : "rounded-[1.35rem] border border-[var(--alavo-gray-20)] bg-[color-mix(in_srgb,var(--alavo-surface)_80%,transparent)] p-6"
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
    </article>
  );
}

export function PricingSection() {
  const market = useBillingMarket();
  const catalog = useLiveCatalog(market);

  return (
    <section id="pricing" className="px-6 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <span className="section-label">Pricing</span>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
          Core tracking is free. Depth is optional.
        </h2>
        <p className="mt-3 max-w-2xl text-base text-[var(--muted)]">{catalog.intro}</p>
        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-[var(--alavo-primary)]">
          {catalog.label}
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <PlanCard
            title={catalog.free.name}
            price={formatMoney(0, catalog.currency)}
            hint={catalog.free.tagline}
            features={catalog.free.features}
          />
          {catalog.packages.map((pkg) => (
            <PlanCard
              key={pkg.sku}
              title={pkg.name}
              price={
                <>
                  {formatMoney(pkg.amount, pkg.currency)}
                  {intervalSuffix(pkg.interval) ? (
                    <span className="text-base font-medium text-[var(--muted)]">
                      {intervalSuffix(pkg.interval)}
                    </span>
                  ) : null}
                </>
              }
              hint={pkg.hint}
              features={pkg.features}
              highlight={pkg.recommended}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`${appUrl}/signup`} className="btn-primary h-12 px-7 text-base">
            Start {TRIAL_DAYS}-day Pro trial
          </Link>
          <Link href={`${appUrl}/login`} className="btn-secondary h-12 px-7 text-base">
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
