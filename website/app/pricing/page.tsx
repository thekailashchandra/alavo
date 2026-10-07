import type { Metadata } from "next";
import { PricingSection } from "@/components/home/pricing";
import { MarketingNav } from "@/components/home/marketing-nav";
import { SiteFooter } from "@/components/home/site-footer";

export const metadata: Metadata = {
  title: "Pricing — Self-host free, or use Alavo Cloud",
  description:
    "Self-host the open-source Alavo habit tracker for free. Alavo Cloud is paid managed hosting. Existing Cloud accounts keep their current access.",
  alternates: { canonical: "https://alavo.cc/pricing" },
};

export default function PricingPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url('/noise.svg')] opacity-[0.28] mix-blend-multiply"
      />
      <MarketingNav />
      <PricingSection />
      <SiteFooter />
    </main>
  );
}
