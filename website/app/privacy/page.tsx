import type { Metadata } from "next";
import { DATA_PROCESSORS, DPDP_POLICY_VERSION, LEGAL } from "@alavo/brand";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Alavo collects, uses, and protects your personal data under Indian law.",
};

export default function PrivacyPage() {
  return (
    <SiteShell title="Privacy Policy">
      <p>
        {LEGAL.productName} (“we”, “us”, “Data Fiduciary”) operates{" "}
        <a href={LEGAL.websiteUrl}>{LEGAL.websiteUrl.replace("https://", "")}</a>{" "}
        and{" "}
        <a href={LEGAL.appUrl}>{LEGAL.appUrl.replace("https://", "")}</a>{" "}
        (together, the “Service”). This Privacy Policy explains how we process
        personal data in compliance with the <strong>Information Technology Act,
        2000</strong> (including rules framed thereunder), the{" "}
        <strong>Digital Personal Data Protection Act (DPDP), 2023</strong>, and
        due-diligence obligations applicable to intermediaries under guidelines
        issued by the <strong>Ministry of Electronics and Information Technology
        (MeitY)</strong>, including the Information Technology (Intermediary
        Guidelines and Digital Media Ethics Code) Rules, 2021.
      </p>

      <p>
        Policy version: <strong>{DPDP_POLICY_VERSION}</strong>. Last updated:{" "}
        {LEGAL.lastUpdated}.
      </p>

      <h2 id="dpdp">1. Roles and applicability</h2>
      <p>
        When you create an account and use the habit-tracking app, we act as a{" "}
        <strong>Data Fiduciary</strong> under the DPDP Act for the personal data
        you provide. You are the <strong>Data Principal</strong>. Where we use
        third-party processors listed below, they process data only on our
        documented instructions and contractual safeguards.
      </p>
      <p>
        The Service is intended for users in India who are at least{" "}
        {LEGAL.minimumAge} years of age. We do not knowingly process personal
        data of children in violation of applicable law.
      </p>

      <h2>2. Personal data we collect</h2>
      <ul>
        <li>
          <strong>Identity and account data</strong> — email address, sign-in
          method (email or Google OAuth), email verification status, timezone,
          and account creation timestamps.
        </li>
        <li>
          <strong>Habit and wellness data</strong> — habits you create, completion
          logs, streaks, optional notes, and journal reflections you choose to
          store.
        </li>
        <li>
          <strong>Preferences and consent records</strong> — notification
          settings, push subscription endpoints (when enabled), email report
          preferences, and a record of your privacy consent (version, timestamp,
          and purposes accepted).
        </li>
        <li>
          <strong>Technical data</strong> — information necessary to operate
          the Service securely (for example session identifiers, server logs,
          and device/browser characteristics). On alavo.cc, optional Google
          Analytics is loaded only after cookie consent.
        </li>
        <li>
          <strong>Payment data</strong> — if you buy Pro monthly, Pro yearly,
          lifetime, or an add-on, Razorpay processes the payment. We store
          payment identifiers, SKU, amount, and status — not your full card
          number.
        </li>
      </ul>
      <p>We do not sell or rent your personal data.</p>

      <h2>3. Lawful purposes and consent</h2>
      <p>
        Under the DPDP Act, we process personal data for specified, explicit,
        and legitimate purposes:
      </p>
      <ul>
        <li>
          <strong>Essential service delivery</strong> (consent at signup) —
          account creation, authentication, habit tracking, journal storage,
          streak calculation, and customer support.
        </li>
        <li>
          <strong>Optional notifications</strong> (separate opt-in) — browser
          push reminders and optional email summaries you enable in Settings.
        </li>
        <li>
          <strong>Website analytics</strong> (separate cookie consent on
          alavo.cc) — aggregated traffic measurement via Google Analytics when
          you choose “Accept analytics”.
        </li>
        <li>
          <strong>Legal and security</strong> — fraud prevention, abuse
          response, compliance with lawful orders, and protection of the Service
          and users (including MeitY intermediary due diligence).
        </li>
      </ul>
      <p>
        You may withdraw optional processing (push, email reports, analytics)
        through Settings or cookie controls without affecting core habit
        tracking, subject to technical limitations.
      </p>

      <h2>4. Data processors</h2>
      <p>
        We engage the following categories of processors. Each processes data
        only to provide services to us:
      </p>
      <ul>
        {DATA_PROCESSORS.map((processor) => (
          <li key={processor.name}>
            <strong>{processor.name}</strong> — {processor.purpose}. Data:{" "}
            {processor.data}.
          </li>
        ))}
      </ul>
      <p>
        Some processors may store or process data outside India. Where required,
        we implement appropriate contractual and technical safeguards
        consistent with the DPDP Act and applicable cross-border transfer
        rules.
      </p>

      <h2>5. Retention</h2>
      <p>
        We retain personal data while your account is active and as needed to
        provide the Service. When you delete your account from Settings, we
        erase associated application data from our primary database, including
        habits, logs, journal entries, and push subscriptions. Short-lived
        backups and security logs may persist for a limited period before
        automatic deletion, unless a longer retention period is required by law
        or a valid government order.
      </p>

      <h2>6. Your rights as a Data Principal</h2>
      <p>Under the DPDP Act, you may:</p>
      <ul>
        <li>
          <strong>Access</strong> — export your data from Settings (JSON or
          CSV), including profile, habits, logs, journal, and subscription
          metadata.
        </li>
        <li>
          <strong>Correction</strong> — update timezone and notification
          preferences in Settings; contact us to correct account email where
          technically feasible.
        </li>
        <li>
          <strong>Erasure</strong> — delete your account from Settings →
          Advanced account options.
        </li>
        <li>
          <strong>Grievance redressal</strong> — contact our Grievance Officer
          (see Section 9). We aim to respond within{" "}
          {LEGAL.grievanceResponseDays} days.
        </li>
        <li>
          <strong>Nominate</strong> — you may nominate another individual to
          exercise your rights in the event of death or incapacity, as permitted
          under the DPDP Act, by writing to us with supporting details.
        </li>
      </ul>

      <h2>7. Intermediary obligations (MeitY)</h2>
      <p>
        As an intermediary hosting user-generated content (habit names, notes,
        journal entries), we:
      </p>
      <ul>
        <li>
          Publish this Privacy Policy and Terms of Service with clear contact
          details.
        </li>
        <li>
          Provide a grievance redressal mechanism and designated contact for
          lawful requests.
        </li>
        <li>
          Act on valid court orders or notifications from appropriate
          government agencies as required by law.
        </li>
        <li>
          Reserve the right to remove content or suspend accounts that violate
          our Terms or applicable Indian law, including unlawful, harmful, or
          infringing material.
        </li>
      </ul>
      <p>
        To report abuse or illegal content, email{" "}
        <a href={`mailto:${LEGAL.grievanceEmail}`}>{LEGAL.grievanceEmail}</a>{" "}
        with sufficient detail for us to assess the report.
      </p>

      <h2>8. Security and personal data breach</h2>
      <p>
        We implement reasonable security safeguards appropriate to the nature
        of the data, including encryption in transit (HTTPS), access controls,
        and secure authentication via Supabase. No method of transmission or
        storage is completely secure. If we become aware of a personal data
        breach likely to affect your rights, we will notify you and the Data
        Protection Board of India as required under the DPDP Act.
      </p>

      <h2>9. Grievance Officer</h2>
      <p>
        In accordance with the DPDP Act and IT Rules, grievances relating to
        personal data processing may be sent to:
      </p>
      <ul>
        <li>
          Email:{" "}
          <a href={`mailto:${LEGAL.grievanceEmail}`}>{LEGAL.grievanceEmail}</a>
        </li>
        <li>Response timeline: within {LEGAL.grievanceResponseDays} days</li>
      </ul>
      <p>
        General product questions may also be sent to{" "}
        <a href={`mailto:${LEGAL.supportEmail}`}>{LEGAL.supportEmail}</a>.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy when laws, our processors, or product
        features change. Material updates will be reflected by revising the
        policy version and “Last updated” date. Where required, we will seek
        renewed consent before applying changes to existing users.
      </p>

      <h2>11. Contact</h2>
      <p>
        Privacy and DPDP queries:{" "}
        <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>
      </p>
    </SiteShell>
  );
}
