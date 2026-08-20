import Link from "next/link";
import type { FaqItem } from "@/lib/faqs";

export function FaqSection({
  faqs,
  title = "Frequently asked questions",
}: {
  faqs: FaqItem[];
  title?: string;
}) {
  return (
    <section
      className="px-6 py-14 md:px-10 md:py-20"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl">
        <span className="section-label">FAQ</span>
        <h2
          id="faq-heading"
          className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl"
        >
          {title}
        </h2>
        <dl className="mt-8 space-y-3">
          {faqs.map((item) => (
            <div
              key={item.question}
              className="surface-card rounded-[1.2rem] px-5 py-4"
            >
              <dt>
                <h3 className="text-base font-semibold text-[var(--foreground)]">
                  {item.question}
                </h3>
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-[var(--muted)]">
          More on{" "}
          <Link href="/insights" className="font-medium text-[var(--primary)] underline-offset-2 hover:underline">
            Insights
          </Link>
          ,{" "}
          <Link href="/pricing" className="font-medium text-[var(--primary)] underline-offset-2 hover:underline">
            pricing
          </Link>
          , and{" "}
          <Link href="/privacy" className="font-medium text-[var(--primary)] underline-offset-2 hover:underline">
            privacy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
