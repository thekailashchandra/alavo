export type Badge = {
  id: string;
  label: string;
  emoji: string;
};

export type GamificationState = {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpToNextLevel: number;
  badges: Badge[];
};

export function computeGamification(opts: {
  habitsCompleted: number;
  totalHabits: number;
  completionRate: number;
  dailyStreak: number;
  bestStreak?: number;
}): GamificationState {
  const { habitsCompleted, completionRate, dailyStreak, bestStreak = dailyStreak } = opts;

  const xp =
    habitsCompleted * 10 +
    dailyStreak * 8 +
    (completionRate === 100 ? 25 : 0);

  const level = Math.max(1, Math.floor(xp / 100) + 1);
  const xpIntoLevel = xp % 100;
  const xpToNextLevel = 100 - xpIntoLevel;

  const badges: Badge[] = [];
  if (habitsCompleted > 0) {
    badges.push({ id: "first", label: "First win", emoji: "✨" });
  }
  if (dailyStreak >= 3) {
    badges.push({ id: "streak-3", label: "3-day streak", emoji: "🔥" });
  }
  if (dailyStreak >= 7) {
    badges.push({ id: "streak-7", label: "Week warrior", emoji: "🏆" });
  }
  if (completionRate === 100 && opts.totalHabits > 0) {
    badges.push({ id: "perfect", label: "Perfect day", emoji: "💯" });
  }
  if (bestStreak >= 14) {
    badges.push({ id: "streak-14", label: "Fortnight hero", emoji: "⭐" });
  }
  if (level >= 5) {
    badges.push({ id: "level-5", label: "Level 5", emoji: "🎯" });
  }

  return { xp, level, xpIntoLevel, xpToNextLevel, badges };
}
