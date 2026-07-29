import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Alavo collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <SiteShell title="Privacy Policy">
      <p>
        Alavo (“we”, “us”) is a habit-tracking product operated for personal
        productivity. This Privacy Policy explains what information we collect
        when you use{" "}
        <a href="https://alavo.cc">alavo.cc</a> and{" "}
        <a href="https://app.alavo.cc">app.alavo.cc</a>, and how we use it.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account information</strong> — name, email address, and
          authentication details when you sign up with email or Google.
        </li>
        <li>
          <strong>Habit and journal data</strong> — habits you create,
          completions, streaks, and optional journal entries.
        </li>
        <li>
          <strong>Device and usage data</strong> — basic technical information
          such as browser type, timezone, and app interaction needed to run the
          product (for example push notification subscriptions you enable).
        </li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>To create and secure your account</li>
        <li>To provide habit tracking, streaks, and reflection features</li>
        <li>To send account emails (verification, password reset, important notices)</li>
        <li>To improve reliability and fix bugs</li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2>Service providers</h2>
      <p>
        We use trusted processors to operate Alavo, including hosting (for
        example Vercel), database and authentication (Neon Auth / Postgres), and
        email delivery. These providers process data only to provide their
        services to us.
      </p>
      <p>
        If you use “Continue with Google”, Google’s authentication flow applies
        under Google’s terms and privacy policy for that sign-in step.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep your account and habit data while your account is active. If you
        delete your account from Settings, we remove associated personal data
        from our application database, subject to short-term backups and legal
        requirements.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Update account details in the app where available</li>
        <li>Disable push notifications in Settings or your device settings</li>
        <li>Delete your account in Settings → Advanced account options</li>
        <li>
          Contact us at{" "}
          <a href="mailto:alavoapp@gmail.com">alavoapp@gmail.com</a> for privacy
          requests
        </li>
      </ul>

      <h2>Children</h2>
      <p>
        Alavo is not directed to children under 13. If you believe a child has
        provided personal information, contact us and we will take appropriate
        steps.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy as the product evolves. We will revise the
        “Last updated” date above when we do.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy:{" "}
        <a href="mailto:alavoapp@gmail.com">alavoapp@gmail.com</a>
      </p>
    </SiteShell>
  );
}
