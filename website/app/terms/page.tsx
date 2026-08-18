import type { Metadata } from "next";
import { DPDP_POLICY_VERSION, LEGAL } from "@alavo/brand";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing your use of Alavo under Indian law.",
};

export default function TermsPage() {
  return (
    <SiteShell title="Terms of Service">
      <p>
        These Terms of Service (“Terms”) govern access to and use of{" "}
        {LEGAL.productName} at{" "}
        <a href={LEGAL.websiteUrl}>{LEGAL.websiteUrl.replace("https://", "")}</a>{" "}
        and{" "}
        <a href={LEGAL.appUrl}>{LEGAL.appUrl.replace("https://", "")}</a>.
        By creating an account, signing in, or using the Service, you agree to
        these Terms and our{" "}
        <a href="/privacy">Privacy Policy</a> (together, the “Agreement”).
      </p>

      <p>
        Terms version: <strong>{DPDP_POLICY_VERSION}</strong>. Last updated:{" "}
        {LEGAL.lastUpdated}.
      </p>

      <h2>1. Legal framework</h2>
      <p>
        This Agreement is subject to the laws of India, including the{" "}
        <strong>Information Technology Act, 2000</strong>, the{" "}
        <strong>Digital Personal Data Protection Act (DPDP), 2023</strong>, the
        Consumer Protection Act, 2019 (where applicable), and intermediary
        due-diligence rules prescribed by{" "}
        <strong>MeitY</strong> under the Information Technology (Intermediary
        Guidelines and Digital Media Ethics Code) Rules, 2021.
      </p>

      <h2>2. The service</h2>
      <p>
        {LEGAL.productName} is a personal productivity application for tracking
        habits, streaks, and optional journal reflections. Features may evolve
        over time. We strive for reliability but do not guarantee uninterrupted
        availability or error-free streak calculations.
      </p>

      <h2>3. Eligibility and accounts</h2>
      <ul>
        <li>
          You must be at least <strong>{LEGAL.minimumAge} years old</strong> and
          legally competent to enter into a binding contract under Indian law.
        </li>
        <li>
          You must provide accurate registration information and keep your
          credentials secure.
        </li>
        <li>
          You consent to processing of your personal data as described in our
          Privacy Policy when you create an account or continue using the
          Service after policy updates.
        </li>
        <li>
          One person may not maintain multiple accounts to abuse the Service or
          circumvent enforcement actions.
        </li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose under Indian law.</li>
        <li>
          Upload, store, or transmit content that is defamatory, obscene,
          harassing, infringing, hateful, or otherwise prohibited under the IT
          Act or applicable criminal law.
        </li>
        <li>
          Attempt unauthorized access, scrape the Service, reverse engineer
          client software except as permitted by law, or interfere with
          infrastructure.
        </li>
        <li>
          Abuse authentication, email, push notification, or support channels.
        </li>
        <li>
          Impersonate another person or misrepresent your affiliation.
        </li>
      </ul>
      <p>
        We may remove content or suspend accounts that violate these Terms or
        applicable law, consistent with our intermediary obligations.
      </p>

      <h2>5. Your content</h2>
      <p>
        You retain ownership of habits, notes, journal entries, and other
        content you create (“User Content”). You grant us a limited, non-exclusive
        license to host, store, back up, and process User Content solely to
        operate the Service for you and to comply with law. You represent that
        you have the rights to submit User Content and that it does not violate
        third-party rights or applicable law.
      </p>

      <h2>6. Third-party services</h2>
      <p>
        The Service relies on third-party providers (for example Supabase,
        Vercel, Google OAuth, and optional analytics). Your use of those
        services may also be governed by their terms. We are not responsible
        for third-party websites or services linked from the Service.
      </p>

      <h2>7. Privacy and data protection</h2>
      <p>
        Our collection and use of personal data is described in the{" "}
        <a href="/privacy">Privacy Policy</a>. You may exercise rights of
        access, correction, erasure, and grievance redressal as set out there.
        Optional features such as push notifications and email reports require
        separate opt-in and may be disabled in Settings.
      </p>

      <h2>8. Paid plans, trials, and refunds</h2>
      <p>
        Core habit tracking remains available on the Free plan. Optional Pro,
        Team, lifetime, and add-on purchases are processed in INR by Razorpay.
        New accounts receive a 14-day Pro trial. Recurring Pro and Team access
        sold via Payment Links grants a fixed period of access (a v1 billing
        test before full subscription billing). Lifetime is a one-time unlock.
      </p>
      <p>
        Because digital access is granted immediately after successful payment,
        fees are generally non-refundable except where required by the Consumer
        Protection Act, 2019 or Razorpay's dispute process. See our{" "}
        <a href="/refund">Refund &amp; Cancellation Policy</a> for timelines
        and eligible cases. Contact{" "}
        <a href={`mailto:${LEGAL.supportEmail}`}>{LEGAL.supportEmail}</a> for
        billing issues.
      </p>

      <h2>9. Intermediary status and takedown</h2>
      <p>
        To the extent {LEGAL.productName} qualifies as an intermediary under
        Section 79 of the IT Act, we provide a platform for User Content without
        prior review of all material. We will act on valid orders from courts or
        competent authorities and respond to grievances reported to{" "}
        <a href={`mailto:${LEGAL.grievanceEmail}`}>{LEGAL.grievanceEmail}</a>{" "}
        regarding unlawful or infringing content, in accordance with applicable
        rules.
      </p>

      <h2>10. Disclaimer and limitation of liability</h2>
      <p>
        The Service is provided on an “as is” and “as available” basis to the
        maximum extent permitted by law. We disclaim warranties of
        merchantability, fitness for a particular purpose, and non-infringement
        where allowed. {LEGAL.productName} is a productivity tool, not medical
        or professional advice.
      </p>
      <p>
        To the fullest extent permitted by Indian law, we are not liable for
        indirect, incidental, special, consequential, or punitive damages, or
        for loss of data beyond our reasonable control. Our aggregate liability
        for direct damages arising from the Service shall not exceed the amount
        you paid us in the twelve (12) months preceding the claim, or INR 5,000,
        whichever is greater, except where liability cannot be limited under
        applicable law.
      </p>

      <h2>11. Termination</h2>
      <p>
        You may stop using the Service and delete your account at any time from
        Settings. We may suspend or terminate access if you materially breach
        these Terms, if required by law, or to protect the Service, users, or
        the public. Upon termination, your right to use the Service ceases; data
        handling after account deletion is described in the Privacy Policy.
      </p>

      <h2>12. Governing law and disputes</h2>
      <p>
        These Terms are governed by the laws of India. Subject to applicable
        consumer protection law, courts at Bengaluru, Karnataka shall have
        exclusive jurisdiction over disputes arising from this Agreement, unless
        mandatory law provides otherwise.
      </p>

      <h2>13. Changes</h2>
      <p>
        We may update these Terms. We will revise the version and “Last updated”
        date when we do. Continued use after material changes become effective
        constitutes acceptance, except where renewed consent is required under
        the DPDP Act.
      </p>

      <h2>14. Contact</h2>
      <p>
        Questions about these Terms:{" "}
        <a href={`mailto:${LEGAL.supportEmail}`}>{LEGAL.supportEmail}</a>
        <br />
        Grievances (privacy / intermediary):{" "}
        <a href={`mailto:${LEGAL.grievanceEmail}`}>{LEGAL.grievanceEmail}</a>
      </p>
    </SiteShell>
  );
}
