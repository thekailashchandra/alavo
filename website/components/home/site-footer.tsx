import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--alavo-gray-20)] bg-white/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between md:px-10">
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Alavo</p>
          <p className="mt-1 max-w-sm text-sm text-[var(--muted)]">
            A calm habit tracker for daily routines, streaks, and reflection.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--muted)]">
          <Link href="/pricing" className="transition hover:text-[var(--foreground)]">
            Pricing
          </Link>
          <Link href="/privacy" className="transition hover:text-[var(--foreground)]">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-[var(--foreground)]">
            Terms
          </Link>
          <Link href="/refund" className="transition hover:text-[var(--foreground)]">
            Refund Policy
          </Link>
          <Link href="/contact" className="transition hover:text-[var(--foreground)]">
            Contact
          </Link>
          <Link href="/about" className="transition hover:text-[var(--foreground)]">
            About
          </Link>
          <span>© {new Date().getFullYear()} Alavo</span>
        </div>
      </div>
    </footer>
  );
}
