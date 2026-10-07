import Link from "next/link";

const appUrl = (
  process.env.NEXT_PUBLIC_PRODUCT_URL || "https://app.alavo.cc"
).replace(/\/$/, "");

export function ClosingCta() {
  return (
    <section className="px-6 pb-12 pt-4 md:px-10 md:pb-16">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.85rem] border border-[var(--alavo-gray-20)] bg-[linear-gradient(135deg,rgba(123,8,224,0.14),rgba(255,255,255,0.82)_42%,rgba(248,242,255,0.98))] px-6 py-12 text-center shadow-[0_24px_60px_-40px_rgba(123,8,224,0.35)] md:px-12 md:py-14">
        <span className="section-label">Get started</span>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
          Your calmer habit tracker is one tap away
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-base text-[var(--muted)]">
          Self-host the open-source tracker for free, or use Alavo Cloud if you
          want the app hosted for you.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href={`${appUrl}/signup`} className="btn-primary h-12 px-7 text-base">
            Get Alavo Cloud
          </Link>
          <Link href="/self-host" className="btn-secondary h-12 px-7 text-base">
            Self-host for free
          </Link>
        </div>
      </div>
    </section>
  );
}
