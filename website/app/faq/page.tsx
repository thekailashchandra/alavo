import type { Metadata } from "next";
import { FaqSection } from "@/components/home/faq-section";
import { MarketingNav } from "@/components/home/marketing-nav";
import { SiteFooter } from "@/components/home/site-footer";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/json-ld";
import { HOME_FAQS } from "@/lib/faqs";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Habit Tracker FAQ",
  description:
    "Answers about habit streaks, how long it takes to form a habit, the 21/90 rule, privacy, and the best free habit tracker.",
  alternates: { canonical: `${SITE_URL}/faq` },
};

export default function FaqPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ],
          SITE_URL
        )}
      />
      <JsonLd data={faqJsonLd(HOME_FAQS)} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url('/noise.svg')] opacity-[0.28] mix-blend-multiply"
      />
      <MarketingNav />
      <FaqSection faqs={HOME_FAQS} title="Habit tracker questions, answered" />
      <SiteFooter />
    </main>
  );
}
