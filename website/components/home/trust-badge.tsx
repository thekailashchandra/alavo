import Link from "next/link";

/** Compact privacy trust cue near primary CTAs. */
export function TrustBadge() {
  return (
    <p className="inline-flex max-w-md items-start gap-2 text-sm leading-snug text-[var(--muted)]">
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]"
        aria-hidden
      >
        <svg
          viewBox="0 0 16 16"
          className="h-3 w-3"
          fill="currentColor"
          aria-hidden
        >
          <path d="M8 1.5 2.5 4v3.8c0 3.4 2.2 5.9 5.5 6.7 3.3-.8 5.5-3.3 5.5-6.7V4L8 1.5Zm0 5.8V11c-2-.6-3.3-2.2-3.3-4.1V5.2L8 3.7l3.3 1.5v1.7c0 1.9-1.3 3.5-3.3 4.1V7.3H8Z" />
        </svg>
      </span>
      <span>
        We never sell your data ·{" "}
        <Link
          href="/privacy"
          className="font-medium text-[var(--primary)] underline underline-offset-2"
        >
          Privacy Policy
        </Link>
      </span>
    </p>
  );
}
