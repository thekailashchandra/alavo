import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import {
  addDays,
  endOfMonth,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
} from "date-fns";

export type ReportPeriod = "daily" | "weekly" | "monthly";

export type DateRange = {
  startDate: string; // yyyy-MM-dd in user tz
  endDate: string;
  label: string;
  dates: string[];
};

function enumerateDates(startYmd: string, endYmd: string): string[] {
  const dates: string[] = [];
  let cur = new Date(`${startYmd}T12:00:00.000Z`);
  const end = new Date(`${endYmd}T12:00:00.000Z`);
  while (cur <= end) {
    dates.push(format(cur, "yyyy-MM-dd"));
    cur = addDays(cur, 1);
  }
  return dates;
}

/** Build the report window for "now" in the user's timezone (previous complete period). */
export function getReportRange(
  period: ReportPeriod,
  timeZone: string,
  now = new Date()
): DateRange {
  const zoned = toZonedTime(now, timeZone);

  if (period === "daily") {
    const day = subDays(zoned, 1);
    const ymd = format(day, "yyyy-MM-dd");
    return {
      startDate: ymd,
      endDate: ymd,
      label: format(day, "MMM d, yyyy").toUpperCase(),
      dates: [ymd],
    };
  }

  if (period === "weekly") {
    const thisWeekStart = startOfWeek(zoned, { weekStartsOn: 1 });
    const prevWeekEnd = subDays(thisWeekStart, 1);
    const prevWeekStart = startOfWeek(prevWeekEnd, { weekStartsOn: 1 });
    const startDate = format(prevWeekStart, "yyyy-MM-dd");
    const endDate = format(prevWeekEnd, "yyyy-MM-dd");
    return {
      startDate,
      endDate,
      label: `${format(prevWeekStart, "MMM d")} – ${format(prevWeekEnd, "MMM d")}`.toUpperCase(),
      dates: enumerateDates(startDate, endDate),
    };
  }

  const prev = subMonths(zoned, 1);
  const start = startOfMonth(prev);
  const end = endOfMonth(prev);
  const startDate = format(start, "yyyy-MM-dd");
  const endDate = format(end, "yyyy-MM-dd");
  return {
    startDate,
    endDate,
    label: format(prev, "MMMM yyyy").toUpperCase(),
    dates: enumerateDates(startDate, endDate),
  };
}

export function localHour(timeZone: string, now = new Date()) {
  return Number(formatInTimeZone(now, timeZone, "H"));
}

export function localWeekday(timeZone: string, now = new Date()) {
  return Number(formatInTimeZone(now, timeZone, "i"));
}

export function localDayOfMonth(timeZone: string, now = new Date()) {
  return Number(formatInTimeZone(now, timeZone, "d"));
}

export function periodTitle(period: ReportPeriod) {
  if (period === "daily") return "Your Daily Report";
  if (period === "weekly") return "Your Weekly Report";
  return "Your Monthly Report";
}

export function displayNameFromEmail(email: string) {
  const raw = email.split("@")[0] || "there";
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}
