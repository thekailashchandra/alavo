import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-zA-Z]/, "Password must include a letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^a-zA-Z0-9]/, "Password must include a symbol");

export const signupSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: passwordSchema,
  timezone: z.string().min(1).max(64).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(1, "Password is required"),
  timezone: z.string().min(1).max(64).optional(),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const resendVerificationSchema = z.object({
  email: z.string().email().max(255),
});

export const habitFrequencySchema = z.discriminatedUnion("frequencyType", [
  z.object({
    frequencyType: z.literal("DAILY"),
    weekdays: z.array(z.number().int().min(0).max(6)).optional(),
    timesPerWeek: z.null().optional(),
  }),
  z.object({
    frequencyType: z.literal("WEEKDAYS"),
    weekdays: z.array(z.number().int().min(0).max(6)).min(1).max(7),
    timesPerWeek: z.null().optional(),
  }),
  z.object({
    frequencyType: z.literal("TIMES_PER_WEEK"),
    weekdays: z.array(z.number().int().min(0).max(6)).optional(),
    timesPerWeek: z.number().int().min(1).max(7),
  }),
]);

const habitFieldsSchema = z.object({
  name: z.string().trim().min(1).max(80),
  icon: z.string().min(1).max(64).default("Circle"),
  frequencyType: z.enum(["DAILY", "WEEKDAYS", "TIMES_PER_WEEK"]),
  weekdays: z.array(z.number().int().min(0).max(6)).default([]),
  timesPerWeek: z.number().int().min(1).max(7).nullable().optional(),
  targetTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time is required"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .nullable()
    .optional(),
  durationMinutes: z.number().int().min(5).max(24 * 60).nullable().optional(),
  reminderEnabled: z.boolean().default(false),
});

function refineHabitFrequency(
  data: {
    frequencyType?: "DAILY" | "WEEKDAYS" | "TIMES_PER_WEEK";
    weekdays?: number[];
    timesPerWeek?: number | null;
  },
  ctx: z.RefinementCtx
) {
  if (data.frequencyType === "WEEKDAYS" && (data.weekdays?.length ?? 0) === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Select at least one weekday",
      path: ["weekdays"],
    });
  }
  if (data.frequencyType === "TIMES_PER_WEEK" && !data.timesPerWeek) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "timesPerWeek is required",
      path: ["timesPerWeek"],
    });
  }
}

export const createHabitSchema = habitFieldsSchema.superRefine(refineHabitFrequency);

export const updateHabitSchema = habitFieldsSchema
  .partial()
  .extend({
    archived: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
  })
  .superRefine(refineHabitFrequency);

export const reorderHabitsSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
});

export const habitLogSchema = z.object({
  habitId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completed: z.boolean(),
  note: z.string().max(500).nullable().optional(),
});

export const journalSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  wentWell: z.string().max(2000).default(""),
  stressedAbout: z.string().max(2000).default(""),
  tomorrowFocus: z.string().max(2000).default(""),
});

export const journalQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url().max(2048),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export const notificationSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  waterReminder: z
    .object({
      enabled: z.boolean(),
      startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      intervalMinutes: z.number().int().min(30).max(180).default(60),
    })
    .optional(),
  workoutTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .nullable()
    .optional(),
  journalingTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .nullable()
    .optional(),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1),
  confirm: z.literal("DELETE"),
});
