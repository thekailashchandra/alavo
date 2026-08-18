const MESSAGES = {
  perfect: [
    "Perfect day! You're unstoppable.",
    "Every habit done — that's champion energy.",
    "You showed up fully today. Celebrate that.",
  ],
  highStreak: [
    "Your streak is on fire — keep the momentum!",
    "Consistency is your superpower.",
    "Day by day, you're building something real.",
  ],
  halfway: [
    "Halfway there — finish strong!",
    "You're closer than you think. One more push.",
    "Great progress so far. Keep going!",
  ],
  started: [
    "Every checkmark is progress. You've got this.",
    "Small steps still move you forward.",
    "Starting is the hardest part — you did it.",
  ],
  fresh: [
    "A fresh day, a fresh start. Pick one habit to begin.",
    "Progress beats perfection. Start with one win.",
    "Your future self will thank you for showing up.",
  ],
} as const;

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export function getDailyQuote(): { text: string; author: string } {
  const quotes = [
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "Small daily improvements are the key to staggering long-term results.", author: "Unknown" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "Your future is created by what you do today, not tomorrow.", author: "Unknown" },
    { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  ] as const;
  const dayIndex = new Date().getDate() % quotes.length;
  return quotes[dayIndex]!;
}

export function getAchievementNotifications(
  badges: { id: string; label: string; emoji: string }[],
  completionRate: number,
  dailyStreak: number
): { id: string; title: string; message: string; emoji: string }[] {
  const items: { id: string; title: string; message: string; emoji: string }[] = [];

  for (const badge of badges) {
    items.push({
      id: badge.id,
      title: badge.label,
      message: `You unlocked ${badge.label}!`,
      emoji: badge.emoji,
    });
  }

  if (completionRate === 100 && badges.length === 0) {
    items.push({
      id: "perfect-today",
      title: "Perfect day",
      message: "All habits completed today — amazing work!",
      emoji: "💯",
    });
  }

  if (dailyStreak >= 3 && !badges.some((b) => b.id.startsWith("streak"))) {
    items.push({
      id: "streak-notice",
      title: "Streak alert",
      message: `${dailyStreak}-day streak — keep it going!`,
      emoji: "🔥",
    });
  }

  if (items.length === 0) {
    items.push({
      id: "keep-going",
      title: "Keep going",
      message: "Complete a habit today to earn your first achievement.",
      emoji: "✨",
    });
  }

  return items.slice(0, 4);
}

export function getMotivationalMessage(
  completionRate: number,
  dailyStreak: number,
  habitsCompleted: number
): string {
  if (completionRate === 100 && habitsCompleted > 0) return pick(MESSAGES.perfect);
  if (dailyStreak >= 5) return pick(MESSAGES.highStreak);
  if (completionRate >= 50) return pick(MESSAGES.halfway);
  if (habitsCompleted > 0) return pick(MESSAGES.started);
  return pick(MESSAGES.fresh);
}
