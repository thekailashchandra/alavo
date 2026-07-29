import Link from "next/link";
import { BrandLogo } from "@alavo/brand";

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
              href="/privacy"
              className="hidden text-[var(--muted)] transition hover:text-[var(--foreground)] sm:inline"
            >
              Privacy
            </Link>
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
            Alavo
          </h1>
          <p className="text-xl font-medium leading-snug text-[var(--foreground)] md:text-2xl">
            Alavo is a habit tracking app for building daily routines, keeping
            streaks, and reflecting in a simple journal.
          </p>
          <p className="max-w-lg text-base leading-relaxed text-[var(--muted)] md:text-lg">
            With Alavo you can create habits, mark them complete each day, track
            consistency over time, and write short reflections. When you choose
            Continue with Google, Alavo uses your Google account name and email
            only to create and sign you into your Alavo account — we do not sell
            your data. Read our{" "}
            <Link href="/privacy" className="text-[var(--primary)] underline underline-offset-2">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="text-[var(--primary)] underline underline-offset-2">
              Terms of Service
            </Link>
            .
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
              Sign in to Alavo
            </Link>
          </div>
        </section>

        <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-4 text-sm text-[var(--muted)]">
          <span>
            © {new Date().getFullYear()} Alavo
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
