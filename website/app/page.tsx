import Link from "next/link";
import { BrandLogo, brand } from "@alavo/brand";

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

      <div className="relative mx-auto flex min-h-dvh max-w-5xl flex-col px-6 py-8 md:px-10">
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

        <section className="flex flex-1 flex-col justify-center gap-6 py-16 md:max-w-2xl md:py-24">
          <h1 className="brand-title text-5xl leading-none tracking-tight text-[var(--foreground)] md:text-7xl">
            {brand.name}
          </h1>
          <p className="text-xl font-medium leading-snug text-[var(--foreground)] md:text-2xl">
            A calm habit tracker for daily rituals, honest streaks, and quiet
            reflection.
          </p>
          <p className="max-w-md text-base leading-relaxed text-[var(--muted)] md:text-lg">
            Alavo helps you build consistent habits on your phone — log what you
            did today, keep streaks without noise, and reflect in a simple
            journal. Sign in with email or Google to start free.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href={`${appUrl}/signup`}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--primary)] px-6 text-base font-medium text-white transition hover:opacity-90"
            >
              Start free with Alavo
            </Link>
            <Link
              href={`${appUrl}/login`}
              className="inline-flex h-12 items-center justify-center rounded-full border border-black/10 bg-white/60 px-6 text-base font-medium text-[var(--foreground)] backdrop-blur transition hover:bg-white"
            >
              Sign in
            </Link>
          </div>
        </section>

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
