import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { prisma } from "@/lib/prisma";
import { sendPushToUser } from "@/lib/push";
import { getMotivationalMessage } from "@/lib/motivation";
import {
  getTodayInTimezone,
  isHabitDueOnDate,
  type HabitWithLogs,
} from "@/lib/habits";
import type { NotificationSettings } from "@/lib/api-client";

function parseSettings(raw: unknown): NotificationSettings {
  const base: NotificationSettings = { enabled: false };
  if (!raw || typeof raw !== "object") return base;
  const value = raw as NotificationSettings;
  return {
    enabled: Boolean(value.enabled),
    waterReminder: value.waterReminder,
    workoutTime: value.workoutTime,
    journalingTime: value.journalingTime,
    emailReports: value.emailReports,
  };
}

function minutesSinceMidnight(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** True if `now` is within `windowMinutes` after `target` (same calendar day). */
export function isTimeInReminderWindow(
  now: string,
  target: string,
  windowMinutes = 15
) {
  const nowM = minutesSinceMidnight(now);
  const targetM = minutesSinceMidnight(target);
  return nowM >= targetM && nowM < targetM + windowMinutes;
}

type ReminderDedup = Record<string, string>;

function readDedup(raw: unknown): ReminderDedup {
  if (!raw || typeof raw !== "object") return {};
  const settings = raw as NotificationSettings & { reminderDedup?: ReminderDedup };
  return settings.reminderDedup ?? {};
}

export async function runScheduledReminders() {
  const users = await prisma.user.findMany({
    where: { pushSubscriptions: { some: {} } },
    include: {
      pushSubscriptions: true,
      habits: {
        where: { archived: false, reminderEnabled: true },
        include: {
          logs: {
            where: {
              date: {
                gte: format(new Date(Date.now() - 14 * 86400000), "yyyy-MM-dd"),
              },
            },
          },
        },
      },
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const user of users) {
    const settings = parseSettings(user.notificationSettings);
    if (!settings.enabled) {
      skipped += user.habits.length;
      continue;
    }

    const timezone = user.timezone || "UTC";
    const today = getTodayInTimezone(timezone);
    const nowLocal = format(toZonedTime(new Date(), timezone), "HH:mm");
    const dedup = readDedup(user.notificationSettings);

    for (const habit of user.habits) {
      if (!habit.targetTime) {
        skipped += 1;
        continue;
      }

      const habitWithLogs = habit as HabitWithLogs;
      if (!isHabitDueOnDate(habitWithLogs, today, timezone)) {
        skipped += 1;
        continue;
      }

      if (!isTimeInReminderWindow(nowLocal, habit.targetTime)) {
        skipped += 1;
        continue;
      }

      const slot = `${today}T${habit.targetTime}`;
      if (dedup[habit.id] === slot) {
        skipped += 1;
        continue;
      }

      const alreadyDone = habit.logs.some(
        (log) => log.date === today && log.completed
      );
      if (alreadyDone) {
        skipped += 1;
        continue;
      }

      try {
        await sendPushToUser(user.id, {
          title: habit.name,
          body: getMotivationalMessage(0, 0, 0),
          url: "/today",
        });

        const nextSettings = {
          ...(typeof user.notificationSettings === "object" &&
          user.notificationSettings !== null
            ? (user.notificationSettings as object)
            : {}),
          reminderDedup: { ...dedup, [habit.id]: slot },
        };

        await prisma.user.update({
          where: { id: user.id },
          data: { notificationSettings: nextSettings },
        });

        sent += 1;
      } catch {
        skipped += 1;
      }
    }
  }

  return { sent, skipped, users: users.length };
}
