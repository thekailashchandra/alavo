import type { ReactNode } from "react";
import { LEGAL } from "@alavo/brand";
import { MarketingNav } from "@/components/home/marketing-nav";
import { SiteFooter } from "@/components/home/site-footer";

export function SiteShell({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url('/noise.svg')] opacity-[0.28] mix-blend-multiply"
      />

      <MarketingNav />

      <article className="relative mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
        <span className="section-label">Legal</span>
        <h1 className="brand-title mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Last updated: {LEGAL.lastUpdated}
        </p>
        <div className="legal-body surface-card mt-10 space-y-6 rounded-[1.35rem] p-6 text-[15px] leading-relaxed text-[var(--foreground)]/90 md:p-8">
          {children}
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
