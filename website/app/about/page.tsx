import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "About Alavo — Free Habit Tracker",
  description:
    "Alavo is a free habit tracking app for daily routines, streak tracking, heatmaps, and a simple journal.",
  alternates: { canonical: "https://alavo.cc/about" },
  openGraph: {
    title: "About Alavo",
    siteName: "Alavo",
    description:
      "Alavo is a habit tracking app for daily routines, streaks, and journaling.",
    url: "https://alavo.cc/about",
  },
};

export default function AboutPage() {
  return (
    <SiteShell title="Alavo" eyebrow="About">
      <p>
        <strong>Alavo</strong> is a habit tracking web app. The purpose of Alavo
        is to help people build consistent daily habits, track streaks, and
        reflect in a simple journal.
      </p>

      <h2>What Alavo does</h2>
      <ul>
        <li>
          Create and organize personal habits in a{" "}
          <Link href="/">free habit tracker</Link>
        </li>
        <li>Mark habits complete each day on the Today screen</li>
        <li>
          Track streaks, heatmaps, and consistency — see{" "}
          <Link href="/insights/streak-tracking">why consistency beats perfection</Link>
        </li>
        <li>Write short journal reflections</li>
        <li>Sign in with email or Google to use your Alavo account</li>
      </ul>

      <h2>How Alavo uses Google account data</h2>
      <p>
        If you choose Continue with Google, Alavo requests your Google account
        name and email address only to create and authenticate your Alavo
        account. Alavo does not sell your personal data.
      </p>

      <h2>Product links</h2>
      <ul>
        <li>
          <a href="https://app.alavo.cc/signup">Open Alavo app (sign up)</a>
        </li>
        <li>
          <a href="https://app.alavo.cc/login">Sign in to Alavo</a>
        </li>
        <li>
          <Link href="/privacy">Alavo Privacy Policy</Link>
        </li>
        <li>
          <Link href="/terms">Alavo Terms of Service</Link>
        </li>
      </ul>
    </SiteShell>
  );
}
