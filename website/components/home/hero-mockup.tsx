/**
 * Static product UI mockup for the marketing hero.
 * Replace with a real screenshot later if desired — keep outer frame classes.
 */
export function HeroMockup() {
  const habits = [
    { name: "Morning stretch", done: true, streak: 12 },
    { name: "Read 20 minutes", done: true, streak: 8 },
    { name: "Drink water", done: false, streak: 21 },
    { name: "Evening journal", done: false, streak: 5 },
  ];

  return (
    <div
      className="hero-mockup relative mx-auto w-full max-w-md"
      aria-hidden="true"
    >
      <div className="absolute -inset-4 rounded-[2rem] bg-[var(--primary)]/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-black/[0.06] bg-white/80 shadow-[0_24px_60px_-28px_rgba(17,17,17,0.35)] backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
              Today
            </p>
            <p className="mt-0.5 text-lg font-semibold tracking-tight text-[var(--foreground)]">
              Your habits
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--primary)]/10 px-3 py-2 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--primary)]">
              Streak
            </p>
            <p className="text-xl font-semibold tabular-nums text-[var(--foreground)]">
              21
            </p>
          </div>
        </div>

        <ul className="space-y-2.5 p-4">
          {habits.map((habit) => (
            <li
              key={habit.name}
              className="flex items-center gap-3 rounded-2xl border border-black/[0.04] bg-[var(--alavo-surface)] px-3.5 py-3"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  habit.done
                    ? "bg-[var(--primary)] text-white"
                    : "border border-black/10 bg-white text-transparent"
                }`}
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3.5 8.2 6.4 11l6.1-6.5" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium ${
                    habit.done
                      ? "text-[var(--muted)] line-through decoration-black/20"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  {habit.name}
                </p>
              </div>
              <span className="shrink-0 text-xs font-medium tabular-nums text-[var(--muted)]">
                {habit.streak}d
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-black/[0.06] px-5 py-3.5">
          <div className="h-2 overflow-hidden rounded-full bg-black/[0.06]">
            <div className="h-full w-1/2 rounded-full bg-[var(--primary)]" />
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">2 of 4 complete today</p>
        </div>
      </div>
    </div>
  );
}
