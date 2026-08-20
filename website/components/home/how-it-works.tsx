const STEPS = [
  {
    step: "01",
    title: "Add your habits",
    description:
      "Create routines in seconds with daily, custom-day, or weekly targets and optional reminders.",
  },
  {
    step: "02",
    title: "Check in on Today",
    description:
      "See your week at a glance, tap purple toggles to complete habits, and watch your progress ring fill up.",
  },
  {
    step: "03",
    title: "Stay consistent",
    description:
      "Track streaks, review analytics, reflect in your journal, and earn milestones along the way.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      className="px-6 py-16 md:px-10 md:py-20"
      aria-labelledby="how-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-label">How it works</span>
          <h2
            id="how-heading"
            className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl"
          >
            How to track habits daily in three steps
          </h2>
        </div>

        <ol className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
          {STEPS.map((item, index) => (
            <li
              key={item.step}
              className="step-card surface-card rounded-[1.35rem] p-6"
              style={{ animationDelay: `${100 + index * 90}ms` }}
            >
              <span className="text-gradient text-sm font-bold tracking-widest">
                {item.step}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-[var(--foreground)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
