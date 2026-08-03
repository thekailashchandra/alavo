import { prisma } from "@/lib/prisma";
import {
  displayNameFromEmail,
  getReportRange,
  periodTitle,
  type ReportPeriod,
} from "@/lib/reports/period";

export type HabitReportRow = {
  id: string;
  name: string;
  icon: string;
  completions: number;
  expectedDays: number;
  rate: number; // 0-100
  dayStatuses: boolean[]; // aligned to range.dates
};

export type UserReportData = {
  userId: string;
  email: string;
  name: string;
  period: ReportPeriod;
  title: string;
  rangeLabel: string;
  dates: string[];
  habits: HabitReportRow[];
  totalCompletions: number;
  overallRate: number;
  summary: string;
};

function isExpectedDay(
  frequencyType: "DAILY" | "WEEKDAYS" | "TIMES_PER_WEEK",
  weekdays: number[],
  dateYmd: string
) {
  const day = new Date(`${dateYmd}T12:00:00.000Z`).getUTCDay(); // 0 Sun
  if (frequencyType === "DAILY") return true;
  if (frequencyType === "WEEKDAYS") return day >= 1 && day <= 5;
  // TIMES_PER_WEEK: any day can count toward the weekly quota
  if (weekdays?.length) return weekdays.includes(day);
  return true;
}

function expectedCount(
  frequencyType: "DAILY" | "WEEKDAYS" | "TIMES_PER_WEEK",
  weekdays: number[],
  timesPerWeek: number | null,
  dates: string[],
  period: ReportPeriod
) {
  if (frequencyType === "TIMES_PER_WEEK") {
    const perWeek = Math.max(1, timesPerWeek || 1);
    if (period === "daily") return 1;
    if (period === "weekly") return perWeek;
    // monthly ≈ 4 weeks
    return perWeek * 4;
  }
  return dates.filter((d) => isExpectedDay(frequencyType, weekdays, d)).length;
}

export async function buildUserReport(
  userId: string,
  period: ReportPeriod,
  now = new Date()
): Promise<UserReportData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      timezone: true,
      habits: {
        where: { archived: false },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          icon: true,
          frequencyType: true,
          weekdays: true,
          timesPerWeek: true,
        },
      },
    },
  });

  if (!user || user.habits.length === 0) return null;

  const range = getReportRange(period, user.timezone || "UTC", now);
  const habitIds = user.habits.map((h) => h.id);
  const logs = await prisma.habitLog.findMany({
    where: {
      habitId: { in: habitIds },
      date: { gte: range.startDate, lte: range.endDate },
      completed: true,
    },
    select: { habitId: true, date: true },
  });

  const completedSet = new Set(logs.map((l) => `${l.habitId}:${l.date}`));

  const habits: HabitReportRow[] = user.habits.map((habit) => {
    const dayStatuses = range.dates.map((d) =>
      completedSet.has(`${habit.id}:${d}`)
    );
    const completions = dayStatuses.filter(Boolean).length;
    const expectedDays = Math.max(
      1,
      expectedCount(
        habit.frequencyType,
        habit.weekdays,
        habit.timesPerWeek,
        range.dates,
        period
      )
    );
    const rate = Math.min(
      100,
      Math.round((completions / expectedDays) * 100)
    );
    return {
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      completions,
      expectedDays,
      rate,
      dayStatuses,
    };
  });

  const totalCompletions = habits.reduce((s, h) => s + h.completions, 0);
  const totalExpected = habits.reduce((s, h) => s + h.expectedDays, 0);
  const overallRate =
    totalExpected > 0
      ? Math.min(100, Math.round((totalCompletions / totalExpected) * 100))
      : 0;

  const name = displayNameFromEmail(user.email);
  let summary: string;
  if (totalCompletions === 0) {
    summary = `${name}, you didn't complete any habits this ${period === "daily" ? "day" : period === "weekly" ? "week" : "month"}. A fresh start is a good start — Alavo is ready when you are.`;
  } else if (overallRate >= 80) {
    summary = `${name}, strong work — you hit about ${overallRate}% of your habit goals. Keep the streak energy going.`;
  } else if (overallRate >= 40) {
    summary = `${name}, you completed ${totalCompletions} habit check-ins (${overallRate}%). Solid progress — a little more consistency will compound.`;
  } else {
    summary = `${name}, you logged ${totalCompletions} completion${totalCompletions === 1 ? "" : "s"} (${overallRate}%). Small steps still count — pick one habit to focus on next.`;
  }

  return {
    userId: user.id,
    email: user.email,
    name,
    period,
    title: periodTitle(period),
    rangeLabel: range.label,
    dates: range.dates,
    habits,
    totalCompletions,
    overallRate,
    summary,
  };
}
