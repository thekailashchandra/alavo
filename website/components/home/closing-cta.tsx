import Link from "next/link";

const appUrl = (
  process.env.NEXT_PUBLIC_PRODUCT_URL || "https://app.alavo.cc"
).replace(/\/$/, "");

/** Final conversion block before the footer. */
export function ClosingCta() {
  return (
    <section className="px-6 pb-10 pt-4 md:px-10 md:pb-14">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] border border-[var(--alavo-gray-20)] bg-[linear-gradient(145deg,rgba(123,8,224,0.12),rgba(255,255,255,0.75)_45%,rgba(248,242,255,0.95))] px-6 py-12 text-center shadow-[0_20px_50px_-36px_rgba(52,54,77,0.2)] md:px-12 md:py-14">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] md:text-3xl">
          Ready to build habits that stick?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base text-[var(--muted)]">
          Start free with Alavo—track today, keep your streak, reflect tonight.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`${appUrl}/signup`}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--primary)] px-6 text-base font-medium text-white transition hover:opacity-90"
          >
            Start free with Alavo
          </Link>
          <Link
            href={`${appUrl}/login`}
            className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--alavo-gray-20)] bg-white/80 px-6 text-base font-medium text-[var(--foreground)] backdrop-blur transition hover:bg-white"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
