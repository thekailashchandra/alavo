import Link from "next/link";
import { ClosingCta } from "@/components/home/closing-cta";
import { FeaturesSection } from "@/components/home/features";
import { HeroMockup } from "@/components/home/hero-mockup";
import { HighlightsSection } from "@/components/home/highlights-section";
import { HowItWorksSection } from "@/components/home/how-it-works";
import { MarketingNav } from "@/components/home/marketing-nav";
import { PricingSection } from "@/components/home/pricing";
import { ProofStrip } from "@/components/home/proof-strip";
import { SiteFooter } from "@/components/home/site-footer";
import { TrustBadge } from "@/components/home/trust-badge";

const appUrl = (
  process.env.NEXT_PUBLIC_PRODUCT_URL || "https://app.alavo.cc"
).replace(/\/$/, "");

const HERO_STATS = [
  "7-day week view",
  "Streak tracking",
  "Analytics charts",
  "Daily journal",
] as const;

export default function HomePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url('/noise.svg')] opacity-[0.28] mix-blend-multiply"
      />

      <MarketingNav />

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <section className="grid items-center gap-12 py-12 md:grid-cols-[1.05fr_0.95fr] md:gap-10 md:py-16 lg:py-20">
          <div className="hero-copy flex flex-col gap-6 md:max-w-xl">
            <span className="section-label w-fit">Free forever · 14-day Pro trial · PWA</span>

            <div className="space-y-4">
              <h1 className="brand-title text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
                Build habits that{" "}
                <span className="text-gradient">actually stick</span>
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-[var(--muted)] md:text-lg">
                Alavo is a calm purple-themed habit tracker with a Today home
                screen, week rings, streaks, analytics, and a simple
                journal—designed to feel as polished as the app you saw in beta.
              </p>
            </div>

            <ul className="flex flex-wrap gap-2">
              {HERO_STATS.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-[var(--alavo-gray-20)] bg-white/75 px-3 py-1.5 text-xs font-semibold text-[var(--foreground)]"
                >
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`${appUrl}/signup`}
                className="btn-primary h-12 px-7 text-base"
              >
                Start free with Alavo
              </Link>
              <Link
                href={`${appUrl}/login`}
                className="btn-secondary h-12 px-7 text-base"
              >
                Sign in
              </Link>
            </div>

            <TrustBadge />
          </div>

          <div className="hero-visual flex justify-center md:justify-end">
            <HeroMockup />
          </div>
        </section>
      </div>

      <ProofStrip />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <HighlightsSection />
      <ClosingCta />
      <SiteFooter />
    </main>
  );
}
