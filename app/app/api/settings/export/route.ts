import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { DPDP_POLICY_VERSION } from "@alavo/brand";
import { getEntitlementSnapshot } from "@/lib/billing/access";

function escapeCsv(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function loadExportData(userId: string) {
  const [profile, habits, journal, pushSubscriptions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        timezone: true,
        provider: true,
        createdAt: true,
        notificationSettings: true,
        accountSettings: true,
        privacyConsent: true,
      },
    }),
    prisma.habit.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    }),
    prisma.pushSubscription.findMany({
      where: { userId },
      select: {
        id: true,
        endpoint: true,
        createdAt: true,
      },
    }),
  ]);

  const habitIds = habits.map((h) => h.id);
  const logs =
    habitIds.length > 0
      ? await prisma.habitLog.findMany({
          where: { habitId: { in: habitIds } },
          orderBy: [{ date: "asc" }, { habitId: "asc" }],
        })
      : [];

  return { profile, habits, logs, journal, pushSubscriptions };
}

function buildCsv(
  data: Awaited<ReturnType<typeof loadExportData>>
) {
  const sections: string[] = [];

  sections.push("PROFILE");
  sections.push(["field", "value"].join(","));
  if (data.profile) {
    for (const [key, value] of Object.entries(data.profile)) {
      sections.push(
        [
          escapeCsv(key),
          escapeCsv(
            value instanceof Date
              ? value.toISOString()
              : typeof value === "object"
                ? JSON.stringify(value)
                : value
          ),
        ].join(",")
      );
    }
  }

  sections.push("");
  sections.push("HABITS");
  sections.push(
    [
      "id",
      "name",
      "icon",
      "frequencyType",
      "weekdays",
      "timesPerWeek",
      "targetTime",
      "reminderEnabled",
      "archived",
      "sortOrder",
      "createdAt",
    ].join(",")
  );
  for (const habit of data.habits) {
    sections.push(
      [
        escapeCsv(habit.id),
        escapeCsv(habit.name),
        escapeCsv(habit.icon),
        escapeCsv(habit.frequencyType),
        escapeCsv(habit.weekdays.join("|")),
        escapeCsv(habit.timesPerWeek),
        escapeCsv(habit.targetTime),
        escapeCsv(habit.reminderEnabled),
        escapeCsv(habit.archived),
        escapeCsv(habit.sortOrder),
        escapeCsv(habit.createdAt.toISOString()),
      ].join(",")
    );
  }

  sections.push("");
  sections.push("LOGS");
  sections.push(["id", "habitId", "date", "completed", "note", "updatedAt"].join(","));
  for (const log of data.logs) {
    sections.push(
      [
        escapeCsv(log.id),
        escapeCsv(log.habitId),
        escapeCsv(log.date),
        escapeCsv(log.completed),
        escapeCsv(log.note),
        escapeCsv(log.updatedAt.toISOString()),
      ].join(",")
    );
  }

  sections.push("");
  sections.push("JOURNAL");
  sections.push(
    [
      "id",
      "date",
      "wentWell",
      "stressedAbout",
      "tomorrowFocus",
      "updatedAt",
    ].join(",")
  );
  for (const entry of data.journal) {
    sections.push(
      [
        escapeCsv(entry.id),
        escapeCsv(entry.date),
        escapeCsv(entry.wentWell),
        escapeCsv(entry.stressedAbout),
        escapeCsv(entry.tomorrowFocus),
        escapeCsv(entry.updatedAt.toISOString()),
      ].join(",")
    );
  }

  sections.push("");
  sections.push("PUSH_SUBSCRIPTIONS");
  sections.push(["id", "endpoint", "createdAt"].join(","));
  for (const sub of data.pushSubscriptions) {
    sections.push(
      [
        escapeCsv(sub.id),
        escapeCsv(sub.endpoint),
        escapeCsv(sub.createdAt.toISOString()),
      ].join(",")
    );
  }

  return sections.join("\n");
}

function buildHtmlReport(
  data: Awaited<ReturnType<typeof loadExportData>>
) {
  const date = new Date().toISOString().slice(0, 10);
  const rows = (data.habits ?? [])
    .map((habit) => {
      const logs = data.logs.filter((l) => l.habitId === habit.id && l.completed);
      return `<tr><td>${escapeHtml(habit.name)}</td><td>${logs.length}</td><td>${habit.frequencyType}</td></tr>`;
    })
    .join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Alavo habit report ${date}</title>
  <style>
    body { font-family: Georgia, serif; color: #1f1630; padding: 32px; }
    h1 { font-size: 28px; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th, td { border-bottom: 1px solid #e6e7f6; text-align: left; padding: 8px 0; }
    .muted { color: #6b6f8c; font-size: 13px; }
  </style>
</head>
<body>
  <p class="muted">Alavo · printable report</p>
  <h1>Habit summary</h1>
  <p class="muted">${escapeHtml(data.profile?.email ?? "")} · exported ${date}</p>
  <table>
    <thead><tr><th>Habit</th><th>Completions</th><th>Schedule</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <script>window.addEventListener("load", () => setTimeout(() => window.print(), 250));</script>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") ?? "json";

    if (format === "csv" || format === "html" || format === "pdf") {
      const entitlements = await getEntitlementSnapshot(user!.id);
      if (!entitlements.features.advancedExport) {
        return jsonError(
          "Formatted CSV and PDF reports are a paid add-on. JSON export stays free.",
          402,
          { code: "PAYWALL", feature: "advancedExport" }
        );
      }
    }

    const data = await loadExportData(user!.id);

    if (format === "csv") {
      const csv = buildCsv(data);
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="alavo-export-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    if (format === "html" || format === "pdf") {
      return new Response(buildHtmlReport(data), {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    if (format === "json") {
      return jsonOk({
        exportedAt: new Date().toISOString(),
        policyVersion: DPDP_POLICY_VERSION,
        profile: data.profile,
        habits: data.habits,
        logs: data.logs,
        journal: data.journal,
        pushSubscriptions: data.pushSubscriptions,
      });
    }

    return jsonError('Invalid format. Use "json", "csv", or "html".', 400);
  } catch (error) {
    return handleApiError(error);
  }
}
