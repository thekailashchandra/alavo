import type { Metadata } from "next";
import Link from "next/link";
import { INSIGHTS } from "@/lib/insights";
import { SITE_URL } from "@/lib/site";
import { MarketingNav } from "@/components/home/marketing-nav";
import { SiteFooter } from "@/components/home/site-footer";
import { JsonLd, breadcrumbJsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Habit Insights — How to Build Habits That Stick",
  description:
    "Guides on habit formation, streak tracking, the 21/90 rule, and how to use a free daily habit tracker without burning out.",
  alternates: { canonical: `${SITE_URL}/insights` },
  openGraph: {
    title: "Habit Insights · Alavo",
    description:
      "Research-backed guides on forming habits, streaks, and daily tracking.",
    url: `${SITE_URL}/insights`,
    type: "website",
  },
};

export default function InsightsIndexPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: "Home", path: "/" },
            { name: "Insights", path: "/insights" },
          ],
          SITE_URL
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url('/noise.svg')] opacity-[0.28] mix-blend-multiply"
      />
      <MarketingNav />
      <section className="relative mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
        <span className="section-label">Insights</span>
        <h1 className="brand-title mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-5xl">
          How to build a daily habit tracking routine
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
          Short, practical guides from Alavo — an open-source habit tracker with streaks,
          heatmaps, and a journal. Start with two habits. Never miss twice.
        </p>
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {INSIGHTS.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/insights/${article.slug}`}
                className="surface-card block h-full rounded-[1.35rem] p-6 transition hover:border-[var(--alavo-primary-30)]"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--alavo-primary)]">
                  {article.date}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">
                  {article.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {article.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <SiteFooter />
    </main>
  );
}
