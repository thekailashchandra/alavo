import type { Metadata } from "next";
import { LEGAL } from "@alavo/brand";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Refund and cancellation policy for Alavo paid plans.",
};

export default function RefundPage() {
  return (
    <SiteShell title="Refund & Cancellation Policy">
      <p>
        This Refund and Cancellation Policy applies to all paid plans and
        one-time purchases on {LEGAL.productName} (
        <a href={LEGAL.appUrl}>{LEGAL.appUrl.replace("https://", "")}</a>).
        Last updated: <strong>{LEGAL.lastUpdated}</strong>.
      </p>

      <h2>1. How billing works</h2>
      <p>
        Alavo offers optional paid plans — Pro monthly, Pro yearly, Team
        monthly, and a one-time Lifetime unlock — processed in INR via Razorpay
        Payment Links. Each payment grants a fixed period of access. There is no
        automatic recurring charge; you choose to renew when your plan period ends.
      </p>

      <h2>2. Digital access and non-refundability</h2>
      <p>
        Because digital access (unlimited habits, full history, advanced
        analytics) is granted immediately upon successful payment, fees are
        generally <strong>non-refundable</strong> once the plan has been
        activated, except as required by the Consumer Protection Act, 2019 or
        Razorpay&apos;s dispute process.
      </p>

      <h2>3. Eligible refund situations</h2>
      <p>
        We will process a full refund within <strong>7 business days</strong> if:
      </p>
      <ul>
        <li>You were charged but access was not granted due to a technical error.</li>
        <li>You were charged twice for the same plan period.</li>
        <li>
          You request a refund within <strong>48 hours</strong> of purchase and
          have not made use of any Pro features during that period.
        </li>
      </ul>

      <h2>4. Cancellation</h2>
      <p>
        There is nothing to cancel. Alavo does not set up auto-debit, UPI
        mandates, or recurring charges. Your plan simply does not renew at the
        end of its period — you stay on the Free plan automatically. No action
        is needed to stop being charged.
      </p>

      <h2>5. How to request a refund</h2>
      <p>
        Email <a href={`mailto:${LEGAL.supportEmail}`}>{LEGAL.supportEmail}</a>{" "}
        with:
      </p>
      <ul>
        <li>Your registered email address</li>
        <li>The Razorpay payment ID (from your payment confirmation email)</li>
        <li>Reason for the refund request</li>
      </ul>
      <p>
        We will acknowledge your request within <strong>2 business days</strong>{" "}
        and resolve it within <strong>7 business days</strong>. Refunds are
        processed back to the original payment method via Razorpay.
      </p>

      <h2>6. Disputes</h2>
      <p>
        If you have raised a dispute through your bank or Razorpay and also
        contact us directly, we will work with Razorpay to resolve the
        chargeback as quickly as possible.
      </p>

      <h2>7. Contact</h2>
      <p>
        For billing questions or refund requests, contact us at{" "}
        <a href={`mailto:${LEGAL.supportEmail}`}>{LEGAL.supportEmail}</a>.
        Response time: within 2 business days.
      </p>
    </SiteShell>
  );
}
