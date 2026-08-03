import { sendMail } from "@/lib/email";
import { renderReportEmailHtml } from "@/lib/reports/email-html";
import {
  localDayOfMonth,
  localHour,
  localWeekday,
  type ReportPeriod,
} from "@/lib/reports/period";
import { buildUserReport } from "@/lib/reports/stats";
import { prisma } from "@/lib/prisma";

export type EmailReportSettings = {
  daily?: boolean;
  weekly?: boolean;
  monthly?: boolean;
  /** Local hour 0–23 to send (default 20) */
  sendHour?: number;
};

function readReportSettings(raw: unknown): EmailReportSettings {
  if (!raw || typeof raw !== "object") return {};
  const nested = (raw as { emailReports?: unknown }).emailReports;
  if (!nested || typeof nested !== "object") return {};
  const s = nested as EmailReportSettings;
  return {
    daily: Boolean(s.daily),
    weekly: Boolean(s.weekly),
    monthly: Boolean(s.monthly),
    sendHour:
      typeof s.sendHour === "number" && s.sendHour >= 0 && s.sendHour <= 23
        ? s.sendHour
        : 20,
  };
}

export async function sendReportToUser(
  userId: string,
  period: ReportPeriod,
  now = new Date()
) {
  const report = await buildUserReport(userId, period, now);
  if (!report) {
    return { ok: false as const, skipped: true as const, reason: "no-habits" };
  }

  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://app.alavo.cc"
  ).replace(/\/$/, "");

  const result = await sendMail({
    to: report.email,
    subject: `${report.title} · Alavo`,
    html: renderReportEmailHtml(report, appUrl),
  });

  if (!result.ok) {
    return {
      ok: false as const,
      skipped: false as const,
      reason: result.error || "send-failed",
    };
  }

  return { ok: true as const, email: report.email, period };
}

function periodsDueNow(
  settings: EmailReportSettings,
  timeZone: string,
  now: Date
): ReportPeriod[] {
  const hour = localHour(timeZone, now);
  const sendHour = settings.sendHour ?? 20;
  if (hour !== sendHour) return [];

  const due: ReportPeriod[] = [];
  // Daily every day at sendHour (covers previous day)
  if (settings.daily) due.push("daily");
  // Weekly on Monday morning/evening for previous week
  if (settings.weekly && localWeekday(timeZone, now) === 1) due.push("weekly");
  // Monthly on the 1st for previous month
  if (settings.monthly && localDayOfMonth(timeZone, now) === 1) {
    due.push("monthly");
  }
  return due;
}

export async function runScheduledReports(now = new Date()) {
  const users = await prisma.user.findMany({
    where: { emailVerified: { not: null } },
    select: {
      id: true,
      email: true,
      timezone: true,
      notificationSettings: true,
    },
  });

  const results: Array<{
    userId: string;
    email: string;
    period: ReportPeriod;
    ok: boolean;
    reason?: string;
  }> = [];

  for (const user of users) {
    const settings = readReportSettings(user.notificationSettings);
    if (!settings.daily && !settings.weekly && !settings.monthly) continue;

    const due = periodsDueNow(settings, user.timezone || "UTC", now);
    for (const period of due) {
      const res = await sendReportToUser(user.id, period, now);
      results.push({
        userId: user.id,
        email: user.email,
        period,
        ok: res.ok,
        reason: "reason" in res ? res.reason : undefined,
      });
    }
  }

  return {
    checked: users.length,
    sent: results.filter((r) => r.ok).length,
    results,
  };
}
