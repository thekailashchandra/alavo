"use client";

import { useEffect, useState } from "react";
import { Bell, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { CreateHabitInput, Habit, HabitSubtask, UpdateHabitInput } from "@/lib/api-client";
import {
  TimeSchedulePicker,
  type TimeScheduleValue,
} from "@/components/habits/time-schedule-picker";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const FREQUENCY_OPTIONS = [
  { value: "DAILY", label: "Daily", description: "Repeat every day" },
  { value: "WEEKDAYS", label: "Custom", description: "Choose specific days" },
  { value: "TIMES_PER_WEEK", label: "Weekly", description: "Set a weekly target" },
] as const;

type HabitFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
  initialDraft?: CreateHabitInput | null;
  onSubmit: (data: CreateHabitInput | UpdateHabitInput) => Promise<void>;
};

type FormState = {
  name: string;
  icon: string;
  frequencyType: Habit["frequencyType"];
  weekdays: number[];
  timesPerWeek: number;
  schedule: TimeScheduleValue;
  reminderEnabled: boolean;
  subtasks: HabitSubtask[];
};

function addMinutesToTime(time: string, mins: number) {
  const [h, m] = time.split(":").map(Number);
  const total = (((h * 60 + m + mins) % (24 * 60)) + 24 * 60) % (24 * 60);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

function durationBetween(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let duration = eh * 60 + em - (sh * 60 + sm);
  if (duration <= 0) duration += 24 * 60;
  return duration;
}

function draftToForm(draft: CreateHabitInput): FormState {
  const start = draft.targetTime ?? "07:00";
  const end = draft.endTime ?? addMinutesToTime(start, draft.durationMinutes ?? 30);
  return {
    name: draft.name,
    icon: draft.icon,
    frequencyType: draft.frequencyType,
    weekdays: draft.weekdays?.length ? draft.weekdays : [1, 2, 3, 4, 5],
    timesPerWeek: draft.timesPerWeek ?? 3,
    schedule: {
      mode: "range",
      targetTime: start,
      endTime: end,
      durationMinutes: durationBetween(start, end),
    },
    reminderEnabled: draft.reminderEnabled ?? false,
    subtasks: draft.subtasks ?? [],
  };
}

function habitToForm(habit?: Habit | null): FormState {
  const start = habit?.targetTime ?? "07:00";
  const end =
    habit?.endTime ??
    addMinutesToTime(start, habit?.durationMinutes ?? 30);

  return {
    name: habit?.name ?? "",
    icon: habit?.icon ?? "Circle",
    frequencyType: habit?.frequencyType ?? "DAILY",
    weekdays: habit?.weekdays?.length ? habit.weekdays : [1, 2, 3, 4, 5],
    timesPerWeek: habit?.timesPerWeek ?? 3,
    schedule: {
      mode: "range",
      targetTime: start,
      endTime: end,
      durationMinutes: durationBetween(start, end),
    },
    reminderEnabled: habit?.reminderEnabled ?? false,
    subtasks: habit?.subtasks ?? [],
  };
}

export function HabitForm({ open, onOpenChange, habit, initialDraft, onSubmit }: HabitFormProps) {
  const [form, setForm] = useState<FormState>(() => habitToForm(habit));

  useEffect(() => {
    if (open) {
      if (habit) setForm(habitToForm(habit));
      else if (initialDraft) setForm(draftToForm(initialDraft));
      else setForm(habitToForm(null));
    }
  }, [open, habit, initialDraft]);

  const toggleWeekday = (day: number) => {
    setForm((prev) => {
      const has = prev.weekdays.includes(day);
      const weekdays = has
        ? prev.weekdays.filter((d) => d !== day)
        : [...prev.weekdays, day].sort((a, b) => a - b);
      return { ...prev, weekdays };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!form.schedule.targetTime) return;

    const payload: CreateHabitInput = {
      name: form.name.trim(),
      icon: form.icon,
      frequencyType: form.frequencyType,
      weekdays: form.frequencyType === "WEEKDAYS" ? form.weekdays : [],
      timesPerWeek:
        form.frequencyType === "TIMES_PER_WEEK" ? form.timesPerWeek : null,
      targetTime: form.schedule.targetTime,
      endTime: form.schedule.endTime || null,
      durationMinutes: form.schedule.durationMinutes,
      reminderEnabled: form.reminderEnabled,
      subtasks: form.subtasks.filter((s) => s.title.trim()),
    };
    onOpenChange(false);
    void onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{habit ? "Edit habit" : "New habit"}</DialogTitle>
          <DialogDescription>
            Set a name and schedule. You can change these anytime.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Name</Label>
            <Input
              id="habit-name"
              placeholder="Morning meditation"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
              maxLength={80}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label>Frequency</Label>
              <span className="text-xs text-muted-foreground">
                {
                  FREQUENCY_OPTIONS.find((option) => option.value === form.frequencyType)
                    ?.description
                }
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 rounded-xl bg-gray-10 p-1 ring-1 ring-gray-20">
              {FREQUENCY_OPTIONS.map(({ value, label }) => {
                const active = form.frequencyType === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, frequencyType: value }))
                    }
                    className={cn(
                      "rounded-lg px-2 py-2 text-xs font-semibold transition",
                      active
                        ? "bg-white text-primary-100 shadow-sm"
                        : "text-gray-60 hover:text-primary-100"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {form.frequencyType === "WEEKDAYS" && (
              <div className="rounded-xl border border-gray-20 bg-primary-10/40 p-3">
                <p className="mb-2 text-xs font-medium text-gray-80">On these days</p>
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEKDAY_LABELS.map((label, index) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleWeekday(index)}
                      className={cn(
                        "h-9 rounded-lg text-xs font-semibold transition",
                        form.weekdays.includes(index)
                          ? "bg-primary-100 text-white shadow-sm shadow-primary-100/25"
                          : "bg-white text-gray-60 ring-1 ring-gray-20 hover:text-primary-100"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.frequencyType === "TIMES_PER_WEEK" && (
              <div className="flex items-center justify-between rounded-xl border border-gray-20 bg-primary-10/40 px-3 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-100">Weekly target</p>
                  <p className="text-xs text-gray-60">Times to complete each week</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        timesPerWeek: Math.max(1, p.timesPerWeek - 1),
                      }))
                    }
                    aria-label="Decrease weekly target"
                  >
                    −
                  </Button>
                  <span className="min-w-8 text-center text-sm font-semibold tabular-nums text-gray-100">
                    {form.timesPerWeek}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        timesPerWeek: Math.min(7, p.timesPerWeek + 1),
                      }))
                    }
                    aria-label="Increase weekly target"
                  >
                    +
                  </Button>
                </div>
              </div>
            )}
          </div>

          <TimeSchedulePicker
            value={form.schedule}
            onChange={(schedule) => setForm((p) => ({ ...p, schedule }))}
          />

          <div className="flex items-center justify-between rounded-xl border border-border px-3 py-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Reminder</p>
                <p className="text-xs text-muted-foreground">
                  Get notified at your start time
                </p>
              </div>
            </div>
            <Switch
              checked={form.reminderEnabled}
              onCheckedChange={(checked) =>
                setForm((p) => ({ ...p, reminderEnabled: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Subtasks</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    subtasks: [
                      ...p.subtasks,
                      { id: crypto.randomUUID(), title: "" },
                    ],
                  }))
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add step
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Break complex habits into smaller steps.
            </p>
            {form.subtasks.length > 0 && (
              <div className="space-y-2">
                {form.subtasks.map((subtask, index) => (
                  <div key={subtask.id} className="flex gap-2">
                    <Input
                      placeholder={`Step ${index + 1}`}
                      value={subtask.title}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          subtasks: p.subtasks.map((s) =>
                            s.id === subtask.id
                              ? { ...s, title: e.target.value }
                              : s
                          ),
                        }))
                      }
                      maxLength={80}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          subtasks: p.subtasks.filter((s) => s.id !== subtask.id),
                        }))
                      }
                      aria-label="Remove subtask"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">
            {habit ? "Save changes" : "Create habit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
