import Link from "next/link";
import { INSIGHTS } from "@/lib/insights";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--alavo-gray-20)] bg-white/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-4 md:px-10">
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Alavo</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-[var(--muted)]">
            Happiness in every habit. A calm corner to slow down, focus, and
            plant small daily routines — with streaks, heatmaps, and a journal.
          </p>
          <p className="mt-4 text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} Alavo
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--alavo-primary)]">
            Product
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <li>
              <Link href="/" className="hover:text-[var(--foreground)]">
                Alavo
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-[var(--foreground)]">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-[var(--foreground)]">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-[var(--foreground)]">
                About
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--alavo-primary)]">
            Insights
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            {INSIGHTS.slice(0, 4).map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/insights/${article.slug}`}
                  className="hover:text-[var(--foreground)]"
                >
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--alavo-primary)]">
            Legal
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <li>
              <Link href="/privacy" className="hover:text-[var(--foreground)]">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-[var(--foreground)]">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/refund" className="hover:text-[var(--foreground)]">
                Refund Policy
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[var(--foreground)]">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
