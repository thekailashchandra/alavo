import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd, breadcrumbJsonLd } from "@/components/json-ld";
import { ClosingCta } from "@/components/home/closing-cta";
import { MarketingNav } from "@/components/home/marketing-nav";
import { SiteFooter } from "@/components/home/site-footer";
import { INSIGHTS, getInsight, relatedInsights } from "@/lib/insights";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return INSIGHTS.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getInsight(slug);
  if (!article) return { title: "Insight" };
  const url = `${SITE_URL}/insights/${article.slug}`;
  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${article.title} · Alavo`,
      description: article.description,
      url,
      type: "article",
      publishedTime: article.date,
    },
  };
}

export default async function InsightArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getInsight(slug);
  if (!article) notFound();
  const related = relatedInsights(article.slug);
  const url = `${SITE_URL}/insights/${article.slug}`;

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: "Home", path: "/" },
            { name: "Insights", path: "/insights" },
            { name: article.title, path: `/insights/${article.slug}` },
          ],
          SITE_URL
        )}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.description,
          datePublished: article.date,
          dateModified: article.date,
          author: { "@type": "Organization", name: "Alavo", url: SITE_URL },
          publisher: { "@type": "Organization", name: "Alavo", url: SITE_URL },
          mainEntityOfPage: url,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url('/noise.svg')] opacity-[0.28] mix-blend-multiply"
      />
      <MarketingNav />
      <article className="relative mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
        <p className="text-sm text-[var(--muted)]">
          <Link href="/insights" className="hover:text-[var(--foreground)]">
            Insights
          </Link>
          <span aria-hidden> / </span>
          <span>{article.title}</span>
        </p>
        <h1 className="brand-title mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
          {article.description}
        </p>
        <div className="article-body mt-10 space-y-8">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="mt-3 text-[15px] leading-relaxed text-[var(--foreground)]/90"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[var(--foreground)]/90">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
        {related.length ? (
          <aside className="mt-12 border-t border-[var(--alavo-gray-20)] pt-8">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Related resources
            </h2>
            <ul className="mt-4 space-y-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/insights/${item.slug}`}
                    className="font-medium text-[var(--primary)] underline-offset-2 hover:underline"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </article>
      <ClosingCta />
      <SiteFooter />
    </main>
  );
}
