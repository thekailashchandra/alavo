import {
  addDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
  subDays,
} from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import type { Habit, HabitLog } from "@prisma/client";

export type HabitWithLogs = Habit & { logs: HabitLog[] };

export type DayStatus = "completed" | "missed_recent" | "missed_long" | "upcoming" | "empty";

export function getTodayInTimezone(timezone: string, date = new Date()) {
  const zoned = toZonedTime(date, timezone);
  return format(zoned, "yyyy-MM-dd");
}

export function getWeekdayInTimezone(timezone: string, dateStr: string) {
  const utc = fromZonedTime(`${dateStr}T12:00:00`, timezone);
  const zoned = toZonedTime(utc, timezone);
  return zoned.getDay();
}

export function isHabitScheduledOnDate(habit: Habit, dateStr: string, timezone: string) {
  if (habit.frequencyType === "DAILY") return true;
  if (habit.frequencyType === "WEEKDAYS") {
    const day = getWeekdayInTimezone(timezone, dateStr);
    return habit.weekdays.includes(day);
  }
  return true;
}

export function getWeekRange(dateStr: string, timezone: string) {
  const utc = fromZonedTime(`${dateStr}T12:00:00`, timezone);
  const zoned = toZonedTime(utc, timezone);
  const start = startOfWeek(zoned, { weekStartsOn: 1 });
  const end = endOfWeek(zoned, { weekStartsOn: 1 });
  return {
    start: format(start, "yyyy-MM-dd"),
    end: format(end, "yyyy-MM-dd"),
  };
}

export function weeklyCompletions(
  habit: HabitWithLogs,
  dateStr: string,
  timezone: string
) {
  const { start, end } = getWeekRange(dateStr, timezone);
  return habit.logs.filter(
    (log) => log.completed && log.date >= start && log.date <= end
  ).length;
}

export function isHabitDueOnDate(
  habit: HabitWithLogs,
  dateStr: string,
  timezone: string
) {
  if (!isHabitScheduledOnDate(habit, dateStr, timezone)) return false;
  if (habit.frequencyType === "TIMES_PER_WEEK") {
    const target = habit.timesPerWeek ?? 1;
    const completed = weeklyCompletions(habit, dateStr, timezone);
    const log = habit.logs.find((l) => l.date === dateStr);
    if (log?.completed) return true;
    return completed < target;
  }
  return true;
}

export function calculateStreaks(
  habit: HabitWithLogs,
  timezone: string,
  today = getTodayInTimezone(timezone)
) {
  const completedDates = new Set(
    habit.logs.filter((l) => l.completed).map((l) => l.date)
  );

  const isSuccessDay = (dateStr: string) => {
    if (habit.frequencyType === "TIMES_PER_WEEK") {
      const { start, end } = getWeekRange(dateStr, timezone);
      const count = habit.logs.filter(
        (l) => l.completed && l.date >= start && l.date <= end
      ).length;
      return count >= (habit.timesPerWeek ?? 1);
    }
    if (!isHabitScheduledOnDate(habit, dateStr, timezone)) return true;
    return completedDates.has(dateStr);
  };

  let current = 0;
  let cursor = today;
  if (!isSuccessDay(today)) {
    cursor = format(subDays(parseISO(today), 1), "yyyy-MM-dd");
  }

  while (isSuccessDay(cursor)) {
    if (
      habit.frequencyType === "DAILY" ||
      habit.frequencyType === "WEEKDAYS"
    ) {
      if (isHabitScheduledOnDate(habit, cursor, timezone)) {
        current += 1;
      }
    } else {
      current += 1;
      const { start } = getWeekRange(cursor, timezone);
      cursor = format(subDays(parseISO(start), 1), "yyyy-MM-dd");
      continue;
    }
    cursor = format(subDays(parseISO(cursor), 1), "yyyy-MM-dd");
    if (current > 10000) break;
  }

  let longest = 0;
  let run = 0;
  const startDate = habit.createdAt;
  const startStr = getTodayInTimezone(timezone, startDate);
  const days = eachDayOfInterval({
    start: parseISO(startStr),
    end: parseISO(today),
  });

  for (const day of days) {
    const dateStr = format(day, "yyyy-MM-dd");
    if (habit.frequencyType === "TIMES_PER_WEEK") {
      const weekday = getWeekdayInTimezone(timezone, dateStr);
      if (weekday !== 0) continue;
      if (isSuccessDay(dateStr)) {
        run += 1;
        longest = Math.max(longest, run);
      } else {
        run = 0;
      }
      continue;
    }
    if (!isHabitScheduledOnDate(habit, dateStr, timezone)) continue;
    if (completedDates.has(dateStr)) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }

  longest = Math.max(longest, current);
  return { current, longest, active: current > 0 };
}

export function daysMissedSinceLastCompletion(
  habit: HabitWithLogs,
  timezone: string,
  today = getTodayInTimezone(timezone)
) {
  const last = habit.logs
    .filter((l) => l.completed)
    .map((l) => l.date)
    .sort()
    .at(-1);

  if (!last) {
    const created = getTodayInTimezone(timezone, habit.createdAt);
    const diff = Math.max(
      0,
      Math.floor(
        (parseISO(today).getTime() - parseISO(created).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    return diff;
  }

  return Math.max(
    0,
    Math.floor(
      (parseISO(today).getTime() - parseISO(last).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
}

export function getDayStatus(
  habit: HabitWithLogs | null,
  dateStr: string,
  timezone: string,
  today = getTodayInTimezone(timezone)
): DayStatus {
  if (dateStr > today) return "upcoming";
  if (!habit) return "empty";

  const log = habit.logs.find((l) => l.date === dateStr);
  if (log?.completed) return "completed";

  if (dateStr === today) {
    if (!isHabitDueOnDate(habit, dateStr, timezone)) return "upcoming";
    return "empty";
  }

  if (!isHabitScheduledOnDate(habit, dateStr, timezone) && habit.frequencyType !== "TIMES_PER_WEEK") {
    return "empty";
  }

  const missed = daysMissedSinceLastCompletion(habit, timezone, dateStr);
  if (missed >= 3) return "missed_long";
  if (missed >= 1) return "missed_recent";
  return "empty";
}

export function buildHeatmap(
  habit: HabitWithLogs | null,
  timezone: string,
  days = 119
) {
  const today = getTodayInTimezone(timezone);
  const start = format(subDays(parseISO(today), days - 1), "yyyy-MM-dd");
  return eachDayOfInterval({
    start: parseISO(start),
    end: parseISO(today),
  }).map((day) => {
    const date = format(day, "yyyy-MM-dd");
    return {
      date,
      status: getDayStatus(habit, date, timezone, today),
    };
  });
}

export function completionRateForRange(
  habits: HabitWithLogs[],
  timezone: string,
  start: string,
  end: string
) {
  let due = 0;
  let done = 0;
  const days = eachDayOfInterval({
    start: parseISO(start),
    end: parseISO(end),
  });

  for (const habit of habits) {
    for (const day of days) {
      const date = format(day, "yyyy-MM-dd");
      if (!isHabitDueOnDate(habit, date, timezone) && habit.frequencyType !== "TIMES_PER_WEEK") {
        if (!isHabitScheduledOnDate(habit, date, timezone)) continue;
      }
      if (habit.frequencyType === "TIMES_PER_WEEK") {
        continue;
      }
      if (!isHabitScheduledOnDate(habit, date, timezone)) continue;
      due += 1;
      if (habit.logs.some((l) => l.date === date && l.completed)) done += 1;
    }
  }

  for (const habit of habits.filter((h) => h.frequencyType === "TIMES_PER_WEEK")) {
    let cursor = start;
    while (cursor <= end) {
      const { start: ws, end: we } = getWeekRange(cursor, timezone);
      const rangeStart = ws < start ? start : ws;
      const rangeEnd = we > end ? end : we;
      const target = habit.timesPerWeek ?? 1;
      const completed = habit.logs.filter(
        (l) => l.completed && l.date >= rangeStart && l.date <= rangeEnd
      ).length;
      due += target;
      done += Math.min(completed, target);
      cursor = format(addDays(parseISO(we), 1), "yyyy-MM-dd");
    }
  }

  return {
    due,
    done,
    rate: due === 0 ? 0 : Math.round((done / due) * 100),
  };
}

export function rateToStatus(rate: number): DayStatus {
  if (rate >= 80) return "completed";
  if (rate >= 50) return "missed_recent";
  if (rate > 0) return "missed_long";
  return "empty";
}

export function dailyCompletionRate(
  habits: HabitWithLogs[],
  dateStr: string,
  timezone: string
) {
  return completionRateForRange(habits, timezone, dateStr, dateStr).rate;
}

const CALENDAR_WEEK_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function getWeekDaySummaries(
  habits: HabitWithLogs[],
  dateStr: string,
  timezone: string,
  today = getTodayInTimezone(timezone)
) {
  const utc = fromZonedTime(`${dateStr}T12:00:00`, timezone);
  const zoned = toZonedTime(utc, timezone);
  const weekStart = startOfWeek(zoned, { weekStartsOn: 0 });

  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(weekStart, index);
    const date = format(day, "yyyy-MM-dd");
    const weekday = getWeekdayInTimezone(timezone, date);

    return {
      date,
      label: CALENDAR_WEEK_LABELS[weekday] ?? format(day, "EEEEE"),
      rate: dailyCompletionRate(habits, date, timezone),
      isToday: date === today,
      isFuture: date > today,
    };
  });
}

export function calculateDailyStreak(
  habits: HabitWithLogs[],
  timezone: string,
  today = getTodayInTimezone(timezone)
) {
  if (habits.length === 0) return 0;

  let streak = 0;
  let cursor = today;
  const todayRate = dailyCompletionRate(habits, today, timezone);

  if (todayRate >= 100) {
    streak = 1;
    cursor = format(subDays(parseISO(today), 1), "yyyy-MM-dd");
  } else {
    cursor = format(subDays(parseISO(today), 1), "yyyy-MM-dd");
  }

  while (dailyCompletionRate(habits, cursor, timezone) >= 100) {
    streak += 1;
    cursor = format(subDays(parseISO(cursor), 1), "yyyy-MM-dd");
    if (streak > 10000) break;
  }

  return streak;
}
