import {
  calculateStreaks,
  completionRateForRange,
  getTodayInTimezone,
  getWeekRange,
  type HabitWithLogs,
} from "@/lib/habits";

export type CoachingInsight = {
  id: string;
  title: string;
  body: string;
  tone: "win" | "nudge" | "plan";
};

export function buildCoachingInsights(
  habits: HabitWithLogs[],
  timezone: string
): CoachingInsight[] {
  const today = getTodayInTimezone(timezone);
  const active = habits.filter((habit) => !habit.archived);
  const insights: CoachingInsight[] = [];

  if (active.length === 0) {
    return [
      {
        id: "start",
        title: "Start with one anchor habit",
        body: "Pick a 5-minute habit you already do most days. Consistency beats intensity for the first two weeks.",
        tone: "plan",
      },
    ];
  }

  const { start: weekStart, end: weekEnd } = getWeekRange(today, timezone);
  const week = completionRateForRange(active, timezone, weekStart, weekEnd);
  const streaks = active.map((habit) => ({
    name: habit.name,
    ...calculateStreaks(habit, timezone, today),
  }));
  const best = streaks.reduce((a, b) => (b.current >= a.current ? b : a), streaks[0]!);
  const weakest = [...active]
    .map((habit) => ({
      name: habit.name,
      rate: completionRateForRange([habit], timezone, weekStart, weekEnd).rate,
    }))
    .sort((a, b) => a.rate - b.rate)[0];

  if (week.rate >= 80) {
    insights.push({
      id: "strong-week",
      title: "This week is compounding",
      body: `You're at ${week.rate}% completion this week. Protect the streak by doing the smallest version of each habit if time gets tight.`,
      tone: "win",
    });
  } else if (week.rate < 40) {
    insights.push({
      id: "reset-week",
      title: "Shrink the plan, don't quit",
      body: `This week's completion is ${week.rate}%. Keep ${best.name} as your non-negotiable and pause one extra habit until the week feels light again.`,
      tone: "nudge",
    });
  }

  if (best.current >= 3) {
    insights.push({
      id: "protect-streak",
      title: `Protect ${best.current} days on ${best.name}`,
      body: "Streaks break at the edges of busy days. Pre-decide a 2-minute fallback so today's check-in still counts.",
      tone: "win",
    });
  }

  if (weakest && weakest.rate < 50) {
    insights.push({
      id: "weakest",
      title: `${weakest.name} needs a smaller cue`,
      body: `It's at ${weakest.rate}% this week. Attach it to something you already never skip — after brushing teeth, after lunch, or right after opening Alavo.`,
      tone: "plan",
    });
  }

  if (active.length > 4) {
    insights.push({
      id: "focus",
      title: "Too many habits dilutes willpower",
      body: `You have ${active.length} active habits. Coaching works better with a core 3. Archive the rest for two weeks, then bring one back.`,
      tone: "nudge",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "steady",
      title: "Steady is the skill",
      body: "Your data looks balanced. Keep the same times this week and only change one habit, not the whole system.",
      tone: "plan",
    });
  }

  return insights.slice(0, 4);
}
