const FEATURES = [
  {
    title: "Daily habit tracking",
    description:
      "Check off routines in a clean today view so progress stays visible and simple.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <rect
          x="4"
          y="4"
          width="16"
          height="16"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M8 12.2 10.6 14.8 16 9.2"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Streaks & consistency",
    description:
      "Watch streaks grow and spot patterns so building habit becomes a rhythm.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M12 3c.8 3.2 2.8 5.1 5.5 6.2-2 .8-3.5 2.4-4.2 4.8-.7-2.4-2.2-4-4.3-4.8C12.2 7.4 12 4.8 12 3Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 14.5c1.3 1.4 2.4 3 3.5 6.5 1.1-3.5 2.2-5.1 3.5-6.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Simple journal",
    description:
      "Capture short reflections so you remember what helped—and what to change.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M7 4.5h8.5A2.5 2.5 0 0 1 18 7v12.2l-3.2-1.8H7A2.5 2.5 0 0 1 4.5 15V7A2.5 2.5 0 0 1 7 4.5Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 9h6M8.5 12.5h4.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const;

/** Three-up feature grid under the social proof strip. */
export function FeaturesSection() {
  return (
    <section className="px-6 py-14 md:px-10 md:py-20" aria-labelledby="features-heading">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto max-w-xl text-center">
          <h2
            id="features-heading"
            className="text-2xl font-semibold tracking-tight text-[var(--foreground)] md:text-3xl"
          >
            Everything you need to stay consistent
          </h2>
          <p className="mt-3 text-base text-[var(--muted)]">
            Lightweight tools for daily action—not another bloated dashboard.
          </p>
        </div>

        <ul className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
          {FEATURES.map((feature, index) => (
            <li
              key={feature.title}
              className="feature-card rounded-[1.35rem] border border-black/[0.06] bg-white/55 p-6 shadow-[0_12px_40px_-32px_rgba(17,17,17,0.45)] backdrop-blur-sm"
              style={{ animationDelay: `${120 + index * 80}ms` }}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                {feature.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-[var(--foreground)]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
