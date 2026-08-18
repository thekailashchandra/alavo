"use client";

import { useEffect, useState } from "react";
import { Bell, ChevronDown, Plus, Trash2 } from "lucide-react";
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
import { HABIT_ICON_NAMES, getHabitIcon } from "@/lib/icons";
import type { CreateHabitInput, Habit, HabitSubtask, UpdateHabitInput } from "@/lib/api-client";
import {
  TimeSchedulePicker,
  type TimeScheduleValue,
} from "@/components/habits/time-schedule-picker";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  const [iconTrayOpen, setIconTrayOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (habit) setForm(habitToForm(habit));
      else if (initialDraft) setForm(draftToForm(initialDraft));
      else setForm(habitToForm(null));
      setIconTrayOpen(false);
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
            Set a name, icon, and schedule. You can change these anytime.
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

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              <button
                type="button"
                onClick={() => setIconTrayOpen((v) => !v)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-zinc-50"
                aria-expanded={iconTrayOpen}
              >
                {(() => {
                  const SelectedIcon = getHabitIcon(form.icon);
                  return (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <SelectedIcon className="h-5 w-5" />
                    </div>
                  );
                })()}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900">{form.icon}</p>
                  <p className="text-xs text-zinc-500">
                    {iconTrayOpen ? "Choose an icon" : "Tap to open icon tray"}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-zinc-400 transition-transform",
                    iconTrayOpen && "rotate-180"
                  )}
                />
              </button>

              {iconTrayOpen && (
                <div className="border-t border-zinc-200 bg-zinc-100 p-2.5">
                  <div className="grid grid-cols-5 gap-1.5">
                    {HABIT_ICON_NAMES.map((iconName) => {
                      const Icon = getHabitIcon(iconName);
                      const selected = form.icon === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => {
                            setForm((p) => ({ ...p, icon: iconName }));
                            setIconTrayOpen(false);
                          }}
                          className={cn(
                            "flex h-10 items-center justify-center rounded-xl transition-colors",
                            selected
                              ? "bg-white text-primary shadow-sm ring-1 ring-primary/30"
                              : "bg-white/60 text-zinc-500 hover:bg-white hover:text-zinc-700"
                          )}
                          aria-label={iconName}
                        >
                          <Icon className="h-5 w-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <div className="grid grid-cols-1 gap-2">
              {(
                [
                  ["DAILY", "Every day"],
                  ["WEEKDAYS", "Specific days"],
                  ["TIMES_PER_WEEK", "Times per week"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setForm((p) => ({ ...p, frequencyType: value }))
                  }
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                    form.frequencyType === value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {form.frequencyType === "WEEKDAYS" && (
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_LABELS.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleWeekday(index)}
                  className={cn(
                    "h-9 min-w-9 rounded-lg border px-2 text-xs font-medium",
                    form.weekdays.includes(index)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-zinc-500"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {form.frequencyType === "TIMES_PER_WEEK" && (
            <div className="space-y-2">
              <Label htmlFor="times-per-week">Target per week</Label>
              <Input
                id="times-per-week"
                type="number"
                min={1}
                max={7}
                value={form.timesPerWeek}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    timesPerWeek: Number(e.target.value),
                  }))
                }
              />
            </div>
          )}

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
