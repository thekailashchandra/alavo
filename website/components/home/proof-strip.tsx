export const SOCIAL_PROOF = {
  headline: "Designed for daily consistency",
  stats: [
    { value: "7", label: "day week view" },
    { value: "50%", label: "completion at a glance" },
    { value: "PWA", label: "install ready" },
  ],
} as const;

export function ProofStrip() {
  return (
    <section
      aria-label="Product highlights"
      className="border-y border-[var(--alavo-gray-20)] bg-white/55 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-8 md:flex-row md:justify-between md:px-10">
        <p className="text-center text-sm font-semibold tracking-tight text-[var(--foreground)] md:text-left md:text-base">
          {SOCIAL_PROOF.headline}
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {SOCIAL_PROOF.stats.map((stat) => (
            <li key={stat.label} className="text-center md:text-left">
              <p className="text-gradient text-lg font-bold tabular-nums tracking-tight">
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
