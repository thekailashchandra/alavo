import Link from "next/link";

export function GuideSection() {
  return (
    <section
      className="px-6 py-14 md:px-10 md:py-20"
      aria-labelledby="guide-heading"
    >
      <div className="mx-auto max-w-3xl">
        <span className="section-label">Guide</span>
        <h2
          id="guide-heading"
          className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl"
        >
          How to use this habit tracker
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
          Open Alavo, then tap Add on Today. Give the habit a
          name, pick an icon, and choose daily, weekdays, or a weekly target.
          Each day, tap the habit to mark it done. The streak counts itself.
          The week rings fill themselves in.
        </p>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
          Analytics shows your history and charts. The journal captures a short
          review of the day. Settings lets you edit, reorder, archive, and
          export. Self-host for the full app, or use paid Alavo Cloud.{" "}
          <Link href="/self-host" className="font-medium text-[var(--primary)] underline-offset-2 hover:underline">
            Self-host for free
          </Link>
          .
        </p>

        <h3 className="mt-10 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Best habit tracker app features
        </h3>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
          A good habit tracker app needs to be fast. If checking off a habit
          takes more than two seconds, you will stop doing it. Alavo opens on a
          Today home screen — avatar, streak pill, seven day rings, completion
          donut — then one tap to complete.
        </p>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
          The heatmap is where it gets interesting. Each cell is one day.
          Colour means you did it, muted means you did not. After a month you
          can see the pattern without thinking about it. Wednesdays are your
          weak day. You never miss when you do it before breakfast. Those are
          the kinds of things a tracker reveals that your memory never will.
        </p>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
          Statistics should tell the truth: current streak, longest streak, and
          completion rate. Seventy percent means twenty-one out of thirty days.
          That is a solid habit. No need to obsess over a perfect flame.{" "}
          <Link href="/insights/streak-tracking" className="font-medium text-[var(--primary)] underline-offset-2 hover:underline">
            Read why consistency beats perfection
          </Link>
          .
        </p>

        <h3 className="mt-10 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          How to build a daily habit tracking routine
        </h3>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
          Same time every day. That is the whole strategy.
        </p>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
          Most people check off habits in the morning (exercise, meditation,
          water) or at night (review of the day). The specific time matters
          less than picking one and not changing it. Start with two habits.
          Maybe three. Not seven. Every habit you add makes all of them weaker.
          Once the first ones feel automatic, usually around week three, add
          another. The goal is not to track more habits. The goal is a daily
          habit tracking routine that runs on autopilot.
        </p>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
          If you open Alavo at the same time every day, opening it becomes the
          cue. The checkmarks become the reward. After about a week, skipping
          the check-in feels off. That is the routine taking hold.{" "}
          <Link href="/insights/habits-that-stick" className="font-medium text-[var(--primary)] underline-offset-2 hover:underline">
            How to build habits that stick
          </Link>
          .
        </p>

        <h3 className="mt-10 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Streak tracking: why consistency beats perfection
        </h3>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
          A streak is consecutive days. It works because losing a 14-day streak
          feels worse than gaining it felt good — loss aversion. The same force
          can make people quit after one miss. The fix is the never-miss-twice
          rule. Miss Monday, show up Tuesday. The streak resets. The habit does
          not. Ninety percent with a broken streak beats sixty percent with a
          streak intact.
        </p>

        <h3 className="mt-10 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          How long does it take to form a habit?
        </h3>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
          Sixty-six days is the average from Phillippa Lally’s 2009 study at
          University College London. The range was 18 to 254 days. Simple
          habits formed faster. Complex ones took longer. Missing one day did
          not significantly slow things down. Missing two days in a row did.{" "}
          <Link href="/insights/how-long-to-form-a-habit" className="font-medium text-[var(--primary)] underline-offset-2 hover:underline">
            Full guide on habit formation
          </Link>
          {" "}and{" "}
          <Link href="/insights/21-90-rule" className="font-medium text-[var(--primary)] underline-offset-2 hover:underline">
            the 21/90 rule explained
          </Link>
          .
        </p>

        <h3 className="mt-10 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Tips for building habits that stick
        </h3>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-[var(--muted)]">
          <li>
            <strong className="text-[var(--foreground)]">Start small:</strong>{" "}
            two habits, not ten. Add more when those feel automatic.
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Stack habits:</strong>{" "}
            after you pour morning coffee, do 10 pushups. The existing action
            answers “when.”
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Track daily:</strong>{" "}
            checking off a habit is a tiny reward. Open Alavo at the same time
            every day.
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Never miss twice:</strong>{" "}
            miss a day, fine. Do it the next day. This rule matters more than
            motivation.
          </li>
          <li>
            <strong className="text-[var(--foreground)]">Celebrate milestones:</strong>{" "}
            7 days, 21 days, 66 days. Each one is real progress.
          </li>
        </ul>
      </div>
    </section>
  );
}
