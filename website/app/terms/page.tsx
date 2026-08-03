import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms that govern your use of Alavo.",
};

export default function TermsPage() {
  return (
    <SiteShell title="Terms of Service">
      <p>
        These Terms of Service (“Terms”) govern your access to and use of Alavo
        at <a href="https://alavo.cc">alavo.cc</a> and{" "}
        <a href="https://app.alavo.cc">app.alavo.cc</a>. By creating an account
        or using Alavo, you agree to these Terms.
      </p>

      <h2>The service</h2>
      <p>
        Alavo is a personal habit tracker that lets you log habits, track
        streaks, and optionally write journal reflections. Features may change
        as we improve the product.
      </p>

      <h2>Accounts</h2>
      <ul>
        <li>You must provide accurate account information</li>
        <li>You are responsible for keeping your login credentials secure</li>
        <li>
          You must be old enough to form a binding contract in your jurisdiction
          (and at least 13 years old)
        </li>
      </ul>

      <h2>Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Misuse the service or attempt unauthorized access</li>
        <li>Interfere with or disrupt Alavo’s infrastructure</li>
        <li>Use Alavo for unlawful purposes</li>
        <li>Abuse email, notifications, or authentication systems</li>
      </ul>

      <h2>Your content</h2>
      <p>
        You retain ownership of the habits, notes, and other content you create.
        You grant us a limited license to host and process that content solely to
        operate Alavo for you.
      </p>

      <h2>Third-party services</h2>
      <p>
        Alavo relies on third-party services (hosting, database, authentication,
        email, and optionally Google sign-in). Your use of those providers may
        also be subject to their terms.
      </p>

      <h2>Availability and disclaimer</h2>
      <p>
        Alavo is provided “as is” and “as available.” We aim for a reliable
        experience but do not guarantee uninterrupted service or perfect
        accuracy of streak calculations or notifications.
      </p>
      <p>
        To the fullest extent permitted by law, we are not liable for indirect,
        incidental, or consequential damages arising from your use of Alavo.
      </p>

      <h2>Termination</h2>
      <p>
        You may stop using Alavo and delete your account at any time. We may
        suspend or terminate access if you violate these Terms or if we need to
        protect the service or other users.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these Terms. Continued use after changes become effective
        constitutes acceptance of the updated Terms. The “Last updated” date
        above will reflect the latest revision.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms:{" "}
        <a href="mailto:hi@alavo.cc">hi@alavo.cc</a>
      </p>
    </SiteShell>
  );
}
