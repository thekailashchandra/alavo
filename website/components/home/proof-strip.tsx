/**
 * Social proof strip under the hero.
 * Edit SOCIAL_PROOF to swap in real numbers when you have them.
 */
export const SOCIAL_PROOF = {
  headline: "Join thousands building better habits",
  // Placeholder stats — replace with real metrics later
  stats: [
    { value: "50,000+", label: "habits tracked" },
    { value: "120+", label: "day streaks kept" },
    { value: "4.9", label: "avg. weekly consistency" },
  ],
} as const;

export function ProofStrip() {
  return (
    <section
      aria-label="Social proof"
      className="border-y border-[var(--alavo-gray-20)] bg-white/50 backdrop-blur-[2px]"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-8 md:flex-row md:justify-between md:px-10">
        <p className="text-center text-sm font-medium tracking-tight text-[var(--foreground)] md:text-left md:text-base">
          {SOCIAL_PROOF.headline}
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {SOCIAL_PROOF.stats.map((stat) => (
            <li key={stat.label} className="text-center md:text-left">
              <p className="text-lg font-semibold tabular-nums tracking-tight text-[var(--foreground)]">
                {stat.value}
              </p>
              <p className="text-xs text-[var(--muted)]">{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
