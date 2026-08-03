import type { DayStatus } from "@/lib/habits";

export type NotificationSettings = {
  enabled: boolean;
  waterReminder?: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    intervalMinutes: number;
  };
  workoutTime?: string | null;
  journalingTime?: string | null;
  emailReports?: {
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
    /** Local hour 0–23 (default 20) */
    sendHour: number;
  };
};

export type User = {
  id: string;
  email: string;
  emailVerified: string | null;
  timezone: string;
  provider: string;
  createdAt: string;
  notificationSettings: NotificationSettings | null;
};

export type Habit = {
  id: string;
  userId?: string;
  name: string;
  icon: string;
  frequencyType: "DAILY" | "WEEKDAYS" | "TIMES_PER_WEEK";
  weekdays: number[];
  timesPerWeek: number | null;
  targetTime: string | null;
  endTime: string | null;
  durationMinutes: number | null;
  reminderEnabled: boolean;
  archived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type HabitLog = {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  note: string | null;
};

export type HabitWithLogs = Habit & { logs: HabitLog[] };

export type TodayHabitItem = Habit & {
  log: HabitLog | null;
  streaks: { current: number; longest: number; active: boolean };
  logs?: HabitLog[];
};

export type TodayResponse = {
  date: string;
  habits: TodayHabitItem[];
};

export type JournalEntry = {
  id: string;
  date: string;
  wentWell: string;
  stressedAbout: string;
  tomorrowFocus: string;
  createdAt: string;
  updatedAt: string;
};

export type AnalyticsApiResponse = {
  streaks: { habitId: string; name: string; current: number; longest: number; active: boolean }[];
  heatmaps: {
    overall: { date: string; status: DayStatus; due: number; done: number; rate: number }[];
    byHabit: { habitId: string; name: string; days: { date: string; status: DayStatus }[] }[];
  };
  rates: {
    weekly: { due: number; done: number; rate: number };
    monthly: { due: number; done: number; rate: number };
    overall: { due: number; done: number; rate: number; range: { start: string; end: string } };
  };
  bestDayOfWeek: { dayName: string; completions: number };
  overallCompletionPercent: number;
};

export type CreateHabitInput = {
  name: string;
  icon: string;
  frequencyType: Habit["frequencyType"];
  weekdays?: number[];
  timesPerWeek?: number | null;
  targetTime: string;
  endTime?: string | null;
  durationMinutes?: number | null;
  reminderEnabled?: boolean;
};

export type UpdateHabitInput = Partial<CreateHabitInput> & {
  archived?: boolean;
  sortOrder?: number;
};

export type HabitLogInput = {
  habitId: string;
  date: string;
  completed: boolean;
  note?: string | null;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      (data as { error?: string }).error ?? "Request failed",
      res.status,
      (data as { code?: string }).code
    );
  }
  return data as T;
}

export function getTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export const OFFLINE_QUEUE_KEY = "alavo_offline_logs";

export type OfflineLogMutation = HabitLogInput & { queuedAt: string };
