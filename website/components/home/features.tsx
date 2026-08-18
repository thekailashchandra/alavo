const FEATURES = [
  {
    title: "Today home",
    description:
      "Avatar, streak pill, seven day rings, and a completion donut—everything you need in one glance.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M12 4v8l4 2"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Smart scheduling",
    description:
      "Daily, custom weekdays, or weekly targets with compact start/end times and optional reminders.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M6 4v16M18 4v16M4 8h16M4 16h16"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Streaks & analytics",
    description:
      "Modern area and pill charts with 7D–12M ranges to visualize consistency over time.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M12 3c.8 3.2 2.8 5.1 5.5 6.2-2 .8-3.5 2.4-4.2 4.8-.7-2.4-2.2-4-4.3-4.8C12.2 7.4 12 4.8 12 3Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M4 19h16M7 16l3-3 3 2 4-5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Journal & rewards",
    description:
      "Reflect after your day and celebrate milestones with a lightweight rewards section.",
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
  {
    title: "Habit catalog",
    description:
      "Browse ready-made routines or build your own with subtasks, reordering, and archiving.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    ),
  },
  {
    title: "Installable PWA",
    description:
      "Add Alavo to your home screen for fast loading, offline-friendly access, and push reminders.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <path
          d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path d="M9 18h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
] as const;

export function FeaturesSection() {
  return (
    <section
      className="px-6 py-14 md:px-10 md:py-20"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-label">Features</span>
          <h2
            id="features-heading"
            className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl"
          >
            Everything in the app, nothing you don&apos;t need
          </h2>
          <p className="mt-3 text-base text-[var(--muted)]">
            The same purple UI you use in the product—on web, mobile, and as a
            PWA.
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {FEATURES.map((feature, index) => (
            <li
              key={feature.title}
              className="feature-card surface-card rounded-[1.35rem] p-6"
              style={{ animationDelay: `${120 + index * 70}ms` }}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--alavo-primary-20)] text-[var(--primary)]">
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
