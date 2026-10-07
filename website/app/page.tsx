import type { Metadata } from "next";
import Link from "next/link";
import { ClosingCta } from "@/components/home/closing-cta";
import { FaqSection } from "@/components/home/faq-section";
import { FeaturesSection } from "@/components/home/features";
import { GuideSection } from "@/components/home/guide-section";
import { HeroMockup } from "@/components/home/hero-mockup";
import { HighlightsSection } from "@/components/home/highlights-section";
import { HowItWorksSection } from "@/components/home/how-it-works";
import { MarketingNav } from "@/components/home/marketing-nav";
import { PricingSection } from "@/components/home/pricing";
import { ProofStrip } from "@/components/home/proof-strip";
import { RelatedInsights } from "@/components/home/related-insights";
import { SiteFooter } from "@/components/home/site-footer";
import { TrustBadge } from "@/components/home/trust-badge";
import { JsonLd, faqJsonLd } from "@/components/json-ld";
import { HOME_FAQS } from "@/lib/faqs";
import { APP_URL, DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_URL } from "@/lib/site";

const HERO_STATS = [
  "Open source",
  "Streak tracking",
  "Visual heatmap",
  "Daily journal",
] as const;

export const metadata: Metadata = {
  title: { absolute: DEFAULT_TITLE },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "open source habit tracker",
    "self-hosted habit tracker",
    "daily habit tracker",
    "streak tracking",
    "habit heatmap",
    "habit tracker app",
    "Alavo",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: "Alavo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};

export default function HomePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Alavo",
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Web, iOS, Android",
          url: SITE_URL,
          description: DEFAULT_DESCRIPTION,
          offers: [
            {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description: "Self-hosted open-source app",
            },
            {
              "@type": "Offer",
              price: "5",
              priceCurrency: "USD",
              description: "Alavo Cloud monthly hosting",
            },
          ],
        }}
      />
      <JsonLd data={faqJsonLd(HOME_FAQS)} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url('/noise.svg')] opacity-[0.28] mix-blend-multiply"
      />

      <MarketingNav />

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <section className="grid items-center gap-12 py-12 md:grid-cols-[1.05fr_0.95fr] md:gap-10 md:py-16 lg:py-20">
          <div className="hero-copy flex flex-col gap-6 md:max-w-xl">
            <span className="section-label w-fit">
              Open source · Self-host free · Alavo Cloud is paid
            </span>

            <div className="space-y-4">
              <h1 className="brand-title text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
                Your habits.{" "}
                <span className="text-gradient">Your data. Your choice.</span>
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-[var(--muted)] md:text-lg">
                A beautiful, privacy-first, open-source habit tracker. Self-host
                it for free, or let Alavo host it for you.
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
              <Link href={`${APP_URL}/signup`} className="btn-primary h-12 px-7 text-base">
                Get Alavo Cloud
              </Link>
              <Link href="/self-host" className="btn-secondary h-12 px-7 text-base">
                Self-host for free
              </Link>
              <Link
                href="https://github.com/thekailashchandra/alavo"
                className="text-sm font-semibold text-[var(--alavo-primary)]"
              >
                View on GitHub
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
      <GuideSection />
      <RelatedInsights />
      <FaqSection faqs={HOME_FAQS} />
      <PricingSection />
      <HighlightsSection />
      <ClosingCta />
      <SiteFooter />
    </main>
  );
}
