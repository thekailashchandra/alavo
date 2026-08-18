"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Clock, Flame, MessageSquarePlus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatClock, formatDuration, minutesBetween } from "@/lib/utils";
import { HabitToggle } from "@/components/habits/habit-toggle";
import type { TodayHabitItem } from "@/lib/api-client";

type HabitChecklistProps = {
  habits: TodayHabitItem[];
  date: string;
  onToggle: (
    habitId: string,
    completed: boolean,
    note?: string | null,
    subtasksDone?: string[]
  ) => Promise<void>;
  loading?: boolean;
};

function scheduleLabel(habit: TodayHabitItem) {
  const start = formatClock(habit.targetTime);
  const end = formatClock(habit.endTime);
  const duration = formatDuration(
    habit.durationMinutes ?? minutesBetween(habit.targetTime, habit.endTime)
  );

  if (start && end) return { time: `${start} – ${end}`, duration };
  if (start) return { time: start, duration };
  if (end) return { time: `Until ${end}`, duration };
  return { time: null, duration };
}

function MetaChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-gray-10 px-2 py-1 text-[11px] font-medium text-gray-80",
        className
      )}
    >
      {children}
    </span>
  );
}

export function HabitChecklist({
  habits,
  date,
  onToggle,
  loading,
}: HabitChecklistProps) {
  const [noteDialog, setNoteDialog] = useState<{
    habit: TodayHabitItem;
    note: string;
  } | null>(null);
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    setOptimistic((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const habit of habits) {
        if (
          habit.id in next &&
          next[habit.id] === Boolean(habit.log?.completed)
        ) {
          delete next[habit.id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [habits]);

  const handleToggle = async (habit: TodayHabitItem) => {
    if (togglingId === habit.id) return;

    const nextCompleted = !(optimistic[habit.id] ?? habit.log?.completed);
    setTogglingId(habit.id);
    setOptimistic((prev) => ({ ...prev, [habit.id]: nextCompleted }));

    try {
      await onToggle(habit.id, nextCompleted, habit.log?.note ?? null);
    } catch {
      setOptimistic((prev) => {
        const copy = { ...prev };
        delete copy[habit.id];
        return copy;
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleSubtaskToggle = async (habit: TodayHabitItem, subtaskId: string) => {
    if (togglingId === habit.id) return;
    const subtasks = habit.subtasks ?? [];
    if (subtasks.length === 0) return;

    const done = new Set(habit.log?.subtasksDone ?? []);
    if (done.has(subtaskId)) done.delete(subtaskId);
    else done.add(subtaskId);

    const subtasksDone = Array.from(done);
    const allDone = subtasks.every((s) => done.has(s.id));

    setTogglingId(habit.id);
    setOptimistic((prev) => ({ ...prev, [habit.id]: allDone }));

    try {
      await onToggle(
        habit.id,
        allDone,
        habit.log?.note ?? null,
        subtasksDone
      );
    } catch {
      setOptimistic((prev) => {
        const copy = { ...prev };
        delete copy[habit.id];
        return copy;
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaveNote = () => {
    if (!noteDialog) return;
    const { habit, note } = noteDialog;
    setNoteDialog(null);
    setTogglingId(habit.id);
    setOptimistic((prev) => ({ ...prev, [habit.id]: true }));
    void onToggle(habit.id, true, note.trim() || null).finally(() => {
      setTogglingId(null);
    });
  };

  if (loading) {
    return (
      <div className="space-y-3 px-4 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-10" />
        ))}
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="px-4 py-10 text-center">
        <p className="text-sm text-gray-80">
          No habits scheduled for this day.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-3 px-4 pb-4 pt-1">
        {habits.map((habit) => {
          const isDone = optimistic[habit.id] ?? Boolean(habit.log?.completed);
          const isBusy = togglingId === habit.id;
          const schedule = scheduleLabel(habit);

          return (
            <li
              key={habit.id}
              className={cn(
                "rounded-2xl border border-gray-20 bg-white p-3.5 shadow-sm transition-colors",
                isDone && "bg-primary-10/40"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="pt-0.5">
                  <HabitToggle
                    checked={isDone}
                    busy={isBusy}
                    label={isDone ? "Mark incomplete" : "Mark complete"}
                    onToggle={() => void handleToggle(habit)}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "min-w-0 truncate text-[15px] font-semibold leading-snug text-gray-100",
                        isDone && "text-gray-60 line-through decoration-gray-30"
                      )}
                    >
                      {habit.name}
                    </p>

                    <div className="flex shrink-0 items-center gap-0.5">
                      <Link
                        href={`/habits?edit=${habit.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-60 transition hover:bg-gray-10 hover:text-primary-100"
                        aria-label={`Edit ${habit.name}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-60 hover:bg-gray-10 hover:text-primary-100"
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
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <MetaChip>
                      <Clock className="h-3 w-3 text-gray-60" />
                      {schedule.time ?? "No time set"}
                    </MetaChip>
                    {schedule.duration ? (
                      <MetaChip>{schedule.duration}</MetaChip>
                    ) : null}
                    <MetaChip
                      className={cn(
                        habit.streaks.active && "text-primary-100"
                      )}
                    >
                      <Flame
                        className={cn(
                          "h-3 w-3",
                          habit.streaks.active
                            ? "fill-primary-100 text-primary-100"
                            : "text-gray-60"
                        )}
                      />
                      {habit.streaks.current > 0
                        ? `${habit.streaks.current} day streak`
                        : "No streak"}
                    </MetaChip>
                    {habit.weeklyProgress ? (
                      <MetaChip className="text-primary-100">
                        {habit.weeklyProgress.completed}/
                        {habit.weeklyProgress.target} this week
                      </MetaChip>
                    ) : null}
                    {habit.reminderEnabled ? (
                      <MetaChip>Reminder on</MetaChip>
                    ) : null}
                  </div>

                  {habit.frequencyType !== "TIMES_PER_WEEK" && (
                    <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-gray-20">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-80 to-primary-100 transition-all duration-300"
                        style={{ width: isDone ? "100%" : "0%" }}
                      />
                    </div>
                  )}

                  {habit.subtasks && habit.subtasks.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t border-gray-10 pt-3">
                      {habit.subtasks.map((subtask) => {
                        const subDone =
                          habit.log?.subtasksDone?.includes(subtask.id) ?? false;
                        return (
                          <li key={subtask.id}>
                            <button
                              type="button"
                              onClick={() =>
                                void handleSubtaskToggle(habit, subtask.id)
                              }
                              className="flex w-full items-center gap-2 rounded-lg px-1 py-1.5 text-left text-xs transition hover:bg-gray-10"
                            >
                              <span
                                className={cn(
                                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                                  subDone
                                    ? "border-primary-100 bg-primary-100 text-white"
                                    : "border-gray-30 bg-white"
                                )}
                              >
                                {subDone && <Check className="h-3 w-3" />}
                              </span>
                              <span
                                className={cn(
                                  "text-gray-80",
                                  subDone && "text-gray-60 line-through"
                                )}
                              >
                                {subtask.title}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {habit.log?.note && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-80">
                      {habit.log.note}
                    </p>
                  )}
                </div>
              </div>
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
          <Button onClick={() => void handleSaveNote()}>Save note</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
