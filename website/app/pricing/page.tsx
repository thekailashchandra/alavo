import type { Metadata } from "next";
import { PricingSection } from "@/components/home/pricing";
import { MarketingNav } from "@/components/home/marketing-nav";
import { SiteFooter } from "@/components/home/site-footer";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Alavo is free for core habit tracking. Pro, Team, lifetime, and a-la-carte add-ons unlock extra depth.",
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
