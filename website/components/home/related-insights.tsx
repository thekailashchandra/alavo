import Link from "next/link";
import { INSIGHTS } from "@/lib/insights";

export function RelatedInsights() {
  return (
    <section className="px-6 pb-8 md:px-10" aria-labelledby="related-heading">
      <div className="mx-auto max-w-6xl">
        <span className="section-label">Related resources</span>
        <h2
          id="related-heading"
          className="mt-4 text-2xl font-semibold tracking-tight text-[var(--foreground)] md:text-3xl"
        >
          Guides for building a daily habit tracking routine
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {INSIGHTS.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/insights/${article.slug}`}
                className="surface-card block h-full rounded-[1.35rem] p-5 transition hover:border-[var(--alavo-primary-30)]"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--alavo-primary)]">
                  Insight
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight text-[var(--foreground)]">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {article.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
