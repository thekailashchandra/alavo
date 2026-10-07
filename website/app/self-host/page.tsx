import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/home/marketing-nav";
import { SiteFooter } from "@/components/home/site-footer";

export const metadata: Metadata = {
  title: "Self-host Alavo",
  description:
    "Run the open-source Alavo habit tracker on your own server. No Alavo Cloud subscription required.",
  alternates: { canonical: "https://alavo.cc/self-host" },
};

const GITHUB_URL = "https://github.com/thekailashchandra/alavo";

export default function SelfHostPage() {
  return (
    <main className="relative min-h-dvh">
      <MarketingNav />
      <article className="mx-auto max-w-3xl px-6 py-16 md:px-10">
        <p className="section-label">Self-hosted</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
          Run Alavo yourself for free
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
          The habit tracker is open source. Self-hosting does not require an
          Alavo Cloud account or a payment. You bring the database and the
          auth project.
        </p>
        <ol className="mt-8 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-[var(--foreground)]">
          <li>Clone the repository and install dependencies with Node.js 20 or newer.</li>
          <li>
            Copy <code>app/.env.example</code> to <code>app/.env</code> and set{" "}
            <code>DEPLOYMENT_MODE=self-hosted</code>.
          </li>
          <li>Point the app at your own Postgres database and Supabase project.</li>
          <li>Run the database migrations, then start the app.</li>
        </ol>
        <p className="mt-6 text-sm leading-relaxed text-[var(--muted)]">
          Docker Compose can start Postgres and the app image. Authentication
          still uses your own Supabase project. Details are in the repository
          under <code>docs/self-hosting</code>.
        </p>
        <div className="mt-8">
          <Link href={GITHUB_URL} className="btn-primary inline-flex h-12 items-center px-6">
            View on GitHub
          </Link>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
