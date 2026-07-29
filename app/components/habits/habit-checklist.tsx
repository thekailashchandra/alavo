"use client";

import { useState } from "react";
import { Check, Flame, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getHabitIcon } from "@/lib/icons";
import { getDayStatus, type HabitWithLogs } from "@/lib/habits";
import { statusBorderClass } from "@/lib/status";
import type { TodayHabitItem } from "@/lib/api-client";

type HabitChecklistProps = {
  habits: TodayHabitItem[];
  date: string;
  timezone: string;
  onToggle: (habitId: string, completed: boolean, note?: string | null) => Promise<void>;
  loading?: boolean;
};

function toHabitWithLogs(habit: TodayHabitItem): HabitWithLogs {
  const logs = habit.log
    ? [
        {
          id: habit.log.id,
          habitId: habit.id,
          date: habit.log.date,
          completed: habit.log.completed,
          note: habit.log.note,
          createdAt: new Date(0),
          updatedAt: new Date(0),
        },
      ]
    : [];
  return {
    ...habit,
    createdAt: new Date(habit.createdAt),
    updatedAt: new Date(habit.updatedAt),
    logs,
  } as HabitWithLogs;
}

export function HabitChecklist({
  habits,
  date,
  timezone,
  onToggle,
  loading,
}: HabitChecklistProps) {
  const [noteDialog, setNoteDialog] = useState<{
    habit: TodayHabitItem;
    note: string;
  } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (habit: TodayHabitItem) => {
    setTogglingId(habit.id);
    try {
      const completed = !habit.log?.completed;
      await onToggle(habit.id, completed, habit.log?.note ?? null);
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaveNote = async () => {
    if (!noteDialog) return;
    setTogglingId(noteDialog.habit.id);
    try {
      await onToggle(
        noteDialog.habit.id,
        true,
        noteDialog.note.trim() || null
      );
      setNoteDialog(null);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 px-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[72px] animate-pulse rounded-2xl bg-muted"
          />
        ))}
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No habits scheduled for today. Add one from the Habits tab.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-3 px-5 pb-6">
        {habits.map((habit) => {
          const Icon = getHabitIcon(habit.icon);
          const isDone = Boolean(habit.log?.completed);
          const isBusy = togglingId === habit.id;
          const status = getDayStatus(toHabitWithLogs(habit), date, timezone, date);

          return (
            <li
              key={habit.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-border bg-white p-4 pl-3 shadow-sm transition-opacity",
                "border-l-4",
                statusBorderClass[status],
                isBusy && "opacity-60"
              )}
            >
              <button
                type="button"
                onClick={() => void handleToggle(habit)}
                disabled={isBusy}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-all",
                  isDone
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-zinc-300 bg-white text-transparent hover:border-zinc-400"
                )}
                aria-label={isDone ? "Mark incomplete" : "Mark complete"}
              >
                <Check className="h-5 w-5" strokeWidth={2.5} />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-zinc-400" />
                  <p
                    className={cn(
                      "truncate font-medium",
                      isDone && "text-zinc-500 line-through"
                    )}
                  >
                    {habit.name}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Flame
                    className={cn(
                      "h-3.5 w-3.5",
                      habit.streaks.active ? "text-green-500" : "text-zinc-300"
                    )}
                  />
                  <span>
                    {habit.streaks.current > 0
                      ? `${habit.streaks.current} day streak`
                      : "No active streak"}
                  </span>
                  {habit.targetTime && (
                    <span className="text-zinc-400">
                      ·{" "}
                      {habit.endTime
                        ? `${habit.targetTime}–${habit.endTime}`
                        : habit.durationMinutes
                          ? `${habit.targetTime} · ${habit.durationMinutes}m`
                          : habit.targetTime}
                    </span>
                  )}
                </div>
                {habit.log?.note && (
                  <p className="mt-1 line-clamp-1 text-xs text-zinc-500">
                    {habit.log.note}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-zinc-400"
                onClick={() =>
                  setNoteDialog({
                    habit,
                    note: habit.log?.note ?? "",
                  })
                }
                aria-label="Add note"
              >
                <MessageSquarePlus className="h-4 w-4" />
              </Button>
            </li>
          );
        })}
      </ul>

      <Dialog
        open={Boolean(noteDialog)}
        onOpenChange={(open) => !open && setNoteDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a note</DialogTitle>
            <DialogDescription>
              Optional reflection for {noteDialog?.habit.name} on {date}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="How did it go?"
            value={noteDialog?.note ?? ""}
            onChange={(e) =>
              setNoteDialog((prev) =>
                prev ? { ...prev, note: e.target.value } : prev
              )
            }
            rows={4}
            maxLength={500}
          />
          <Button onClick={() => void handleSaveNote()} disabled={togglingId !== null}>
            Save note
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
