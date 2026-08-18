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

export type AccountSettings = {
  displayName?: string;
  avatarDataUrl?: string;
  theme?: "indigo" | "light";
  language?: "en" | "hi";
  integrations?: {
    googleCalendar?: boolean;
  };
};

export type BillingSnapshot = {
  plan: "FREE" | "PRO" | "TEAM";
  displayPlan: string;
  status: "free" | "trial" | "active" | "lifetime" | "expired";
  trialEndsAt: string | null;
  planExpiresAt: string | null;
  lifetime: boolean;
  features: {
    unlimitedHabits: boolean;
    advancedAnalytics: boolean;
    fullHistory: boolean;
    aiCoaching: boolean;
    advancedExport: boolean;
    customNotifications: boolean;
    calendarSync: boolean;
    teamGroups: boolean;
  };
  limits: {
    maxHabits: number | null;
    historyDays: number | null;
  };
  addons: string[];
};

export type User = {
  id: string;
  email: string;
  emailVerified: string | null;
  timezone: string;
  provider: string;
  createdAt: string;
  notificationSettings: NotificationSettings | null;
  accountSettings: AccountSettings | null;
  privacyConsent: Record<string, unknown> | null;
  billing?: BillingSnapshot | null;
  isAdmin?: boolean;
};

export type HabitSubtask = {
  id: string;
  title: string;
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
  subtasks?: HabitSubtask[];
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
  subtasksDone?: string[];
};

export type HabitWithLogs = Habit & { logs: HabitLog[] };

export type TodayHabitItem = Habit & {
  log: HabitLog | null;
  streaks: { current: number; longest: number; active: boolean };
  weeklyProgress?: { completed: number; target: number } | null;
  logs?: HabitLog[];
};

export type WeekDaySummary = {
  date: string;
  label: string;
  rate: number;
  isToday: boolean;
  isFuture: boolean;
};

export type TodayResponse = {
  date: string;
  habits: TodayHabitItem[];
  weekDays?: WeekDaySummary[];
  dailyStreak?: number;
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
  historyDays?: number;
  advancedAnalytics?: boolean;
  coachingUnlocked?: boolean;
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
  subtasks?: HabitSubtask[];
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
  subtasksDone?: string[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public feature?: string
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
      (data as { code?: string }).code,
      (data as { feature?: string }).feature
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
