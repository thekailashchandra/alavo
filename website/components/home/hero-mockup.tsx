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
  { name: "Morning stretch", done: true, time: "7:00 AM" },
  { name: "Read 20 minutes", done: true, time: "8:30 AM" },
  { name: "Drink water", done: false, time: "All day" },
] as const;

const NAV_ITEMS = ["Today", "Habits", "Stats", "Journal", "Settings"];

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

/** Static Today-screen mockup inside a phone frame. */
export function HeroMockup() {
  return (
    <div
      className="hero-mockup relative mx-auto w-full max-w-[320px]"
      aria-hidden="true"
    >
      <div className="absolute -inset-8 rounded-[3rem] bg-[var(--primary)]/20 blur-3xl" />

      <div className="relative rounded-[2.2rem] border border-[var(--alavo-gray-30)] bg-[var(--alavo-ink)] p-2 shadow-[0_32px_80px_-28px_rgba(52,54,77,0.45)]">
        <div className="overflow-hidden rounded-[1.85rem] bg-[var(--alavo-surface)]">
          <div className="flex items-center justify-center bg-[var(--alavo-surface)] py-2">
            <span className="h-1.5 w-16 rounded-full bg-[var(--alavo-gray-20)]" />
          </div>

          <div className="bg-[var(--alavo-surface)] px-4 pb-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#A137FD] to-[#510594] text-[10px] font-semibold text-white">
                  AL
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-[#22C55E]" />
              </div>
              <div className="flex items-center gap-1 rounded-full border border-[var(--alavo-gray-20)] bg-white px-2.5 py-1 shadow-sm">
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5 fill-[var(--primary)] text-[var(--primary)]"
                  aria-hidden
                >
                  <path d="M12 3c.8 3.2 2.8 5.1 5.5 6.2-2 .8-3.5 2.4-4.2 4.8-.7-2.4-2.2-4-4.3-4.8C12.2 7.4 12 4.8 12 3Z" />
                </svg>
                <span className="text-xs font-bold tabular-nums text-[var(--foreground)]">
                  21
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-0.5">
              {WEEK_DAYS.map((day) => (
                <div
                  key={day.label}
                  className={`flex flex-col items-center ${day.future ? "opacity-40" : ""}`}
                >
                  <div
                    className={
                      day.active
                        ? "rounded-full ring-2 ring-[#7B08E0]/25 ring-offset-1 ring-offset-[var(--alavo-surface)]"
                        : undefined
                    }
                  >
                    <MockProgressRing
                      value={day.future ? 0 : day.rate}
                      size={32}
                      stroke={2.5}
                      active={day.active}
                      label={day.label}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <p className="text-left text-base font-semibold text-[var(--foreground)]">
                Today
              </p>
              <div className="relative mx-auto mt-2 inline-flex items-center justify-center">
                <MockProgressRing value={50} size={120} stroke={10} active showKnob />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <p className="text-3xl font-bold tabular-nums leading-none text-[var(--foreground)]">
                    50
                    <span className="ml-0.5 text-base font-semibold text-[var(--alavo-gray-60)]">
                      %
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--alavo-gray-20)] bg-white px-3 py-3">
            <div className="mb-2">
              <p className="text-xs font-semibold text-[var(--foreground)]">
                Today&apos;s habits
              </p>
              <p className="text-[10px] text-[var(--muted)]">2 of 4 done</p>
            </div>
            <ul className="space-y-1.5">
              {HABITS.map((habit) => (
                <li
                  key={habit.name}
                  className="flex items-center gap-2 rounded-xl border border-[var(--alavo-gray-20)] bg-[var(--alavo-surface)] px-2.5 py-2"
                >
                  <MockHabitToggle checked={habit.done} />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-xs font-medium ${
                        habit.done
                          ? "text-[var(--muted)] line-through"
                          : "text-[var(--foreground)]"
                      }`}
                    >
                      {habit.name}
                    </p>
                    <p className="text-[9px] text-[var(--muted)]">{habit.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-[var(--alavo-gray-20)] bg-[var(--alavo-primary-20)] px-2 py-2">
            <div className="grid grid-cols-5 gap-1">
              {NAV_ITEMS.map((item, index) => (
                <div
                  key={item}
                  className={`rounded-lg py-1 text-center text-[8px] font-semibold ${
                    index === 0
                      ? "bg-white text-[var(--primary)] shadow-sm"
                      : "text-[var(--alavo-gray-60)]"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
