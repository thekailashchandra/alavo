"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Archive,
  ArchiveRestore,
  Bell,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { cn, formatClock, formatDuration, minutesBetween } from "@/lib/utils";
import type { Habit } from "@/lib/api-client";

type HabitListProps = {
  habits: Habit[];
  showArchived?: boolean;
  onReorder: (orderedIds: string[]) => Promise<void>;
  onEdit: (habit: Habit) => void;
  onArchive: (habit: Habit, archived: boolean) => Promise<void>;
  onDelete: (habit: Habit) => Promise<void>;
  loading?: boolean;
};

const FREQ_LABELS: Record<string, string> = {
  DAILY: "Daily",
  WEEKDAYS: "Custom days",
  TIMES_PER_WEEK: "Weekly target",
};

function SortableHabitRow({
  habit,
  onEdit,
  onArchive,
  onDelete,
}: {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onArchive: (habit: Habit, archived: boolean) => Promise<void>;
  onDelete: (habit: Habit) => Promise<void>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id, disabled: habit.archived });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleArchive = () => {
    setMenuOpen(false);
    void onArchive(habit, !habit.archived);
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    void onDelete(habit);
  };

  return (
    <>
      <li
        ref={setNodeRef}
        style={style}
        className={cn(
          "flex items-center gap-2 rounded-3xl border border-border/80 bg-white p-3 shadow-[0_10px_30px_rgba(17,17,17,0.05)]",
          isDragging && "z-10 opacity-80 shadow-lg",
          habit.archived && "opacity-60"
        )}
      >
        {!habit.archived && (
          <button
            type="button"
            className="touch-none text-zinc-300 hover:text-zinc-500"
            aria-label="Drag to reorder"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{habit.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{FREQ_LABELS[habit.frequencyType]}</Badge>
            {habit.frequencyType === "TIMES_PER_WEEK" && habit.timesPerWeek && (
              <span className="text-xs text-muted-foreground">
                {habit.timesPerWeek}× / week
              </span>
            )}
            {formatClock(habit.targetTime) ? (
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-700">
                {formatClock(habit.targetTime)}
                {formatClock(habit.endTime) ? ` – ${formatClock(habit.endTime)}` : ""}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                No time set
              </span>
            )}
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {formatDuration(
                habit.durationMinutes ??
                  minutesBetween(habit.targetTime, habit.endTime)
              ) ?? "No duration"}
            </span>
            {habit.reminderEnabled && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-primary-30 px-2 py-0.5 text-[11px] font-medium text-primary-100">
                <Bell className="h-3 w-3" />
                Reminder
              </span>
            )}
            {habit.archived && <Badge variant="outline">Archived</Badge>}
          </div>
        </div>

        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-white py-1 shadow-lg">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => {
                    onEdit(habit);
                    setMenuOpen(false);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => void handleArchive()}
                >
                  {habit.archived ? (
                    <>
                      <ArchiveRestore className="h-4 w-4" />
                      Restore
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4" />
                      Archive
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setMenuOpen(false);
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </li>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete habit?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{habit.name}&rdquo; and all
              its history. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => void handleDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function HabitList({
  habits,
  showArchived = false,
  onReorder,
  onEdit,
  onArchive,
  onDelete,
  loading,
}: HabitListProps) {
  const filtered = useMemo(
    () =>
      habits
        .filter((h) => (showArchived ? h.archived : !h.archived))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [habits, showArchived]
  );

  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    setItems(filtered.map((h) => h.id));
  }, [filtered]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 180, tolerance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.indexOf(String(active.id));
    const newIndex = items.indexOf(String(over.id));
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);

    try {
      await onReorder(next);
    } catch {
      setItems(filtered.map((h) => h.id));
      toast.error("Could not save order");
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 px-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          {showArchived
            ? "No archived habits."
            : "No habits yet. Tap + to create your first one."}
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(e) => void handleDragEnd(e)}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <ul className="space-y-3 px-5 pb-6">
          {items.map((id) => {
            const habit = filtered.find((h) => h.id === id);
            if (!habit) return null;
            return (
              <SortableHabitRow
                key={habit.id}
                habit={habit}
                onEdit={onEdit}
                onArchive={onArchive}
                onDelete={onDelete}
              />
            );
          })}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
