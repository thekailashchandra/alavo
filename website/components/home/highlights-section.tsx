const HIGHLIGHTS = [
  {
    title: "Analytics that motivate",
    description:
      "Area charts and pill bars show daily and weekly progress so you can spot momentum early.",
    metric: "7D · 31D · 12M",
  },
  {
    title: "Journal built in",
    description:
      "Capture quick reflections after your day—no separate notes app required.",
    metric: "Daily entries",
  },
  {
    title: "Privacy-first",
    description:
      "Export your data anytime. DPDP-ready consent flows and clear privacy controls.",
    metric: "Your data, yours",
  },
] as const;

export function HighlightsSection() {
  return (
    <section
      className="px-6 pb-4 pt-2 md:px-10"
      aria-labelledby="highlights-heading"
    >
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[1.75rem] border border-[var(--alavo-gray-20)] bg-[linear-gradient(135deg,rgba(123,8,224,0.08),rgba(255,255,255,0.9)_48%,rgba(248,242,255,1))] p-6 md:p-10">
          <div className="max-w-xl">
            <span className="section-label">Built for focus</span>
            <h2
              id="highlights-heading"
              className="mt-4 text-2xl font-semibold tracking-tight text-[var(--foreground)] md:text-3xl"
            >
              More than a checklist
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] md:text-base">
              Alavo pairs a beautiful Today home screen with the tools you need
              to understand and improve your habits over time.
            </p>
          </div>

          <ul className="mt-8 grid gap-3 md:grid-cols-3">
            {HIGHLIGHTS.map((item, index) => (
              <li
                key={item.title}
                className="highlight-card rounded-2xl border border-white/70 bg-white/75 p-5 backdrop-blur-sm"
                style={{ animationDelay: `${140 + index * 80}ms` }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--alavo-primary)]">
                  {item.metric}
                </p>
                <h3 className="mt-2 text-base font-semibold text-[var(--foreground)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
