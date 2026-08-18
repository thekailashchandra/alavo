import Link from "next/link";
import { BrandLogo } from "@alavo/brand";
import { ClosingCta } from "@/components/home/closing-cta";
import { FeaturesSection } from "@/components/home/features";
import { HeroMockup } from "@/components/home/hero-mockup";
import { ProofStrip } from "@/components/home/proof-strip";
import { TrustBadge } from "@/components/home/trust-badge";

const appUrl = (
  process.env.NEXT_PUBLIC_PRODUCT_URL || "https://app.alavo.cc"
).replace(/\/$/, "");

export default function HomePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url('/noise.svg')] opacity-[0.35] mix-blend-multiply"
      />

      <div className="relative mx-auto flex min-h-dvh max-w-5xl flex-col px-6 py-6 md:px-10 md:py-8">
        {/* Nav — unchanged structure */}
        <header className="flex items-center justify-between gap-4">
          <BrandLogo
            priority
            className="h-auto w-[140px] object-contain object-left md:w-[170px]"
          />
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

        {/* Hero: two columns on desktop, stacked on mobile */}
        <section className="grid flex-1 items-center gap-10 py-10 md:grid-cols-2 md:gap-12 md:py-12 lg:gap-16">
          <div className="hero-copy flex flex-col gap-5 md:max-w-xl">
            <h1 className="brand-title text-5xl font-semibold leading-none tracking-tight text-[var(--foreground)] md:text-6xl lg:text-7xl">
              Alavo
            </h1>
            <h2 className="text-2xl font-semibold leading-snug tracking-tight text-[var(--foreground)] md:text-3xl">
              Build habits that actually stick
            </h2>
            <p className="max-w-lg text-base leading-relaxed text-[var(--muted)] md:text-lg">
              Track daily routines with a week-at-a-glance view, keep streaks
              alive, reflect in a simple journal, and see your progress with
              analytics—without the clutter.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={`${appUrl}/signup`}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--primary)] px-6 text-base font-medium text-white transition hover:opacity-90"
              >
                Start free with Alavo
              </Link>
              <Link
                href={`${appUrl}/login`}
                className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--alavo-gray-20)] bg-white/80 px-6 text-base font-medium text-[var(--foreground)] backdrop-blur transition hover:bg-white"
              >
                Sign in to Alavo
              </Link>
            </div>

            <TrustBadge />
          </div>

          <div className="hero-visual md:justify-self-end">
            <HeroMockup />
          </div>
        </section>
      </div>

      <ProofStrip />
      <FeaturesSection />
      <ClosingCta />

      {/* Footer — keep links and copyright as-is */}
      <footer className="relative mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-6 pb-8 pt-2 text-sm text-[var(--muted)] md:px-10">
        <span>© {new Date().getFullYear()} Alavo</span>
        <Link href="/privacy" className="hover:text-[var(--foreground)]">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-[var(--foreground)]">
          Terms
        </Link>
      </footer>
    </main>
  );
}
