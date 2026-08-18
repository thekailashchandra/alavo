import { MockProgressRing } from "@/components/home/mock-progress-ring";

const WEEK_DAYS = [
  { label: "Su", rate: 0, active: false, future: false },
  { label: "Mo", rate: 80, active: false, future: false },
  { label: "Tu", rate: 50, active: true, future: false },
  { label: "We", rate: 40, active: false, future: false },
  { label: "Th", rate: 0, active: false, future: false },
  { label: "Fr", rate: 0, active: false, future: true },
  { label: "Sa", rate: 0, active: false, future: true },
] as const;

const HABITS = [
  { name: "Morning stretch", done: true, streak: 12, time: "7:00 AM" },
  { name: "Read 20 minutes", done: true, streak: 8, time: "8:30 AM" },
  { name: "Drink water", done: false, streak: 21, time: "All day" },
] as const;

function MockHabitToggle({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 ${
        checked
          ? "border-transparent bg-gradient-to-br from-[#7B08E0] to-[#510594] text-white shadow-md shadow-[#7B08E0]/30"
          : "border-[#EEDDFE] bg-white text-transparent"
      }`}
    >
      {checked ? (
        <svg
          viewBox="0 0 16 16"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3.5 8.2 6.4 11l6.1-6.5" />
        </svg>
      ) : null}
    </span>
  );
}

/** Static Today-screen mockup for the marketing hero. */
export function HeroMockup() {
  return (
    <div
      className="hero-mockup relative mx-auto w-full max-w-[340px]"
      aria-hidden="true"
    >
      <div className="absolute -inset-6 rounded-[2.5rem] bg-[var(--primary)]/15 blur-3xl" />

      <div className="relative overflow-hidden rounded-[1.85rem] border border-[var(--alavo-gray-20)] bg-[var(--alavo-surface)] shadow-[0_28px_70px_-32px_rgba(52,54,77,0.35)]">
        {/* Today hero */}
        <div className="bg-[var(--alavo-surface)] px-5 pb-4 pt-5">
          <div className="flex items-center justify-between">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#A137FD] to-[#510594] text-xs font-semibold text-white shadow-sm">
                AL
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#22C55E]" />
            </div>

            <div className="flex items-center gap-1 rounded-full border border-[var(--alavo-gray-20)] bg-white px-3 py-1.5 shadow-sm">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-[var(--primary)] text-[var(--primary)]"
                aria-hidden
              >
                <path d="M12 3c.8 3.2 2.8 5.1 5.5 6.2-2 .8-3.5 2.4-4.2 4.8-.7-2.4-2.2-4-4.3-4.8C12.2 7.4 12 4.8 12 3Z" />
              </svg>
              <span className="text-sm font-bold tabular-nums text-[var(--foreground)]">
                21
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-0.5">
            {WEEK_DAYS.map((day) => (
              <div
                key={day.label}
                className={`flex flex-col items-center ${day.future ? "opacity-40" : ""}`}
              >
                <div
                  className={
                    day.active
                      ? "rounded-full ring-2 ring-[#7B08E0]/25 ring-offset-2 ring-offset-[var(--alavo-surface)]"
                      : undefined
                  }
                >
                  <MockProgressRing
                    value={day.future ? 0 : day.rate}
                    size={36}
                    stroke={3}
                    active={day.active}
                    label={day.label}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 text-center">
            <p className="text-left text-lg font-semibold tracking-tight text-[var(--foreground)]">
              Today
            </p>

            <div className="relative mx-auto mt-3 inline-flex items-center justify-center">
              <MockProgressRing value={50} size={148} stroke={12} active showKnob />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <p className="text-4xl font-bold tabular-nums leading-none text-[var(--foreground)]">
                  50
                  <span className="ml-0.5 text-xl font-semibold text-[var(--alavo-gray-60)]">
                    %
                  </span>
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs font-medium text-[var(--muted)]">
              Keep your streak going
            </p>
          </div>
        </div>

        {/* Habit list preview */}
        <div className="border-t border-[var(--alavo-gray-20)] bg-white px-4 py-4">
          <div className="mb-3 flex items-end justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Today&apos;s habits
              </p>
              <p className="text-[11px] text-[var(--muted)]">2 of 4 done</p>
            </div>
          </div>

          <ul className="space-y-2">
            {HABITS.map((habit) => (
              <li
                key={habit.name}
                className="flex items-center gap-3 rounded-2xl border border-[var(--alavo-gray-20)] bg-[var(--alavo-surface)] px-3 py-2.5"
              >
                <MockHabitToggle checked={habit.done} />
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      habit.done
                        ? "text-[var(--muted)] line-through decoration-[var(--alavo-gray-20)]"
                        : "text-[var(--foreground)]"
                    }`}
                  >
                    {habit.name}
                  </p>
                  <p className="mt-0.5 text-[10px] font-medium text-[var(--muted)]">
                    {habit.time}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-[var(--alavo-surface-deep)] px-2 py-1 text-[10px] font-medium tabular-nums text-[var(--muted)]">
                  {habit.streak}d
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
