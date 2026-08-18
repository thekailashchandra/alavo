import Link from "next/link";
import {
  BILLING_CATALOG,
  FREE_TIER,
  PRO_FEATURES,
  TEAM_FEATURES,
  TRIAL_DAYS,
  formatInr,
} from "@alavo/brand";

const appUrl = (
  process.env.NEXT_PUBLIC_PRODUCT_URL || "https://app.alavo.cc"
).replace(/\/$/, "");

export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <span className="section-label">Pricing</span>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
          Core tracking is free. Depth is optional.
        </h2>
        <p className="mt-3 max-w-2xl text-base text-[var(--muted)]">
          Every new account gets {TRIAL_DAYS} days of Pro. After that, Free stays
          forever for up to 5 habits, basic streaks, and 30-day history. Pay only
          if you want analytics, unlimited habits, or teams.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-[1.35rem] border border-[var(--alavo-gray-20)] bg-white/80 p-6">
            <p className="text-sm font-semibold text-[var(--alavo-primary)]">Free</p>
            <p className="mt-2 text-3xl font-semibold">₹0</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{FREE_TIER.tagline}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {FREE_TIER.features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-[1.35rem] border border-[var(--alavo-primary)] bg-[linear-gradient(180deg,rgba(123,8,224,0.08),white)] p-6 shadow-[0_24px_60px_-40px_rgba(123,8,224,0.45)]">
            <p className="text-sm font-semibold text-[var(--alavo-primary)]">Pro</p>
            <p className="mt-2 text-3xl font-semibold">
              {formatInr(BILLING_CATALOG.PRO_MONTHLY.amountInr)}
              <span className="text-base font-medium text-[var(--muted)]">/mo</span>
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              or {formatInr(BILLING_CATALOG.PRO_YEARLY.amountInr)}/year
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {PRO_FEATURES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-[1.35rem] border border-[var(--alavo-gray-20)] bg-white/80 p-6">
            <p className="text-sm font-semibold text-[var(--alavo-primary)]">
              Lifetime
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {formatInr(BILLING_CATALOG.LIFETIME.amountInr)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              One payment via Razorpay. No recurring billing.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>Everything in Pro, forever</li>
              <li>Built as a v1 monetization test for India</li>
            </ul>
          </article>

          <article className="rounded-[1.35rem] border border-[var(--alavo-gray-20)] bg-white/80 p-6">
            <p className="text-sm font-semibold text-[var(--alavo-primary)]">
              Team / Family
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {formatInr(BILLING_CATALOG.TEAM_MONTHLY.amountInr)}
              <span className="text-base font-medium text-[var(--muted)]">/mo</span>
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">Up to 5 people</p>
            <ul className="mt-4 space-y-2 text-sm">
              {TEAM_FEATURES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
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
