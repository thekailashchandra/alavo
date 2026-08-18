import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo, brand, LEGAL } from "@alavo/brand";

const appUrl = (
  process.env.NEXT_PUBLIC_PRODUCT_URL || "https://app.alavo.cc"
).replace(/\/$/, "");

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
        className="pointer-events-none absolute inset-0 bg-[url('/noise.svg')] opacity-[0.35] mix-blend-multiply"
      />

      <div className="relative mx-auto flex min-h-dvh max-w-3xl flex-col px-6 py-8 md:px-10">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" aria-label={`${brand.name} home`}>
            <BrandLogo
              priority
              className="h-auto w-[140px] object-contain object-left md:w-[170px]"
            />
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href={`${appUrl}/login`}
              className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              Sign in
            </Link>
            <Link
              href={`${appUrl}/signup`}
              className="rounded-full bg-[var(--primary)] px-4 py-2 font-medium text-white transition hover:opacity-90"
            >
              Get started
            </Link>
          </nav>
        </header>

        <article className="flex-1 py-12 md:py-16">
          <h1 className="brand-title text-3xl tracking-tight text-[var(--foreground)] md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Last updated: {LEGAL.lastUpdated}
          </p>
          <div className="legal-body mt-10 space-y-6 text-[15px] leading-relaxed text-[var(--foreground)]/90">
            {children}
          </div>
        </article>

        <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-4 text-sm text-[var(--muted)]">
          <span>
            © {new Date().getFullYear()} {brand.name}
          </span>
          <Link href="/privacy" className="hover:text-[var(--foreground)]">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[var(--foreground)]">
            Terms
          </Link>
        </footer>
      </div>
    </main>
  );
}
