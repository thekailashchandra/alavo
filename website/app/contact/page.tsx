import type { Metadata } from "next";
import { LEGAL } from "@alavo/brand";
import { MarketingNav } from "@/components/home/marketing-nav";
import { SiteFooter } from "@/components/home/site-footer";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Alavo team.",
};

export default function ContactPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url('/noise.svg')] opacity-[0.28] mix-blend-multiply"
      />

      <MarketingNav />

      <section className="relative mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
        <span className="section-label">Contact</span>
        <h1 className="brand-title mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
          Get in touch
        </h1>
        <p className="mt-3 text-base text-[var(--muted)]">
          For support, billing questions, privacy requests, or any other
          enquiry — we respond within 2 business days.
        </p>

        <div className="surface-card mt-10 space-y-8 rounded-[1.35rem] p-6 md:p-8">

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
              General &amp; Support
            </h2>
            <p className="mt-2 text-[15px] text-[var(--foreground)]/90">
              <a
                href={`mailto:${LEGAL.supportEmail}`}
                className="font-medium text-[var(--primary)] hover:underline"
              >
                {LEGAL.supportEmail}
              </a>
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Account help, feature questions, bug reports.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
              Billing &amp; Refunds
            </h2>
            <p className="mt-2 text-[15px] text-[var(--foreground)]/90">
              <a
                href={`mailto:${LEGAL.supportEmail}`}
                className="font-medium text-[var(--primary)] hover:underline"
              >
                {LEGAL.supportEmail}
              </a>
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Payment issues, refund requests, plan questions. See our{" "}
              <a href="/refund" className="underline underline-offset-2">
                Refund &amp; Cancellation Policy
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
              Privacy &amp; Data
            </h2>
            <p className="mt-2 text-[15px] text-[var(--foreground)]/90">
              <a
                href={`mailto:${LEGAL.privacyEmail}`}
                className="font-medium text-[var(--primary)] hover:underline"
              >
                {LEGAL.privacyEmail}
              </a>
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Data access, correction, or erasure requests under the DPDP Act,
              2023. Grievances acknowledged within{" "}
              {LEGAL.grievanceResponseDays} days.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">
              Grievance Officer
            </h2>
            <p className="mt-2 text-[15px] text-[var(--foreground)]/90">
              {LEGAL.operatorName}
              <br />
              <a
                href={`mailto:${LEGAL.grievanceEmail}`}
                className="font-medium text-[var(--primary)] hover:underline"
              >
                {LEGAL.grievanceEmail}
              </a>
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Designated Grievance Officer under IT Act &amp; Consumer
              Protection (E-Commerce) Rules, 2020. Response within{" "}
              {LEGAL.grievanceResponseDays} days.
            </p>
          </div>

        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
