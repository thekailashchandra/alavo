"use client";



import { useEffect, useState } from "react";

import { LayoutGrid, Plus } from "lucide-react";

import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";

import { HabitCatalogDialog } from "@/components/habits/habit-catalog-dialog";

import { HabitForm } from "@/components/habits/habit-form";

import { HabitList } from "@/components/habits/habit-list";

import { Button } from "@/components/ui/button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useCachedQuery } from "@/hooks/use-cached-query";

import { cacheKeys, clearDirty, invalidateCache } from "@/lib/client-cache";

import {

  parseJson,

  type CreateHabitInput,

  type Habit,

  type UpdateHabitInput,

} from "@/lib/api-client";

import type { CatalogHabit } from "@/lib/habit-catalog";



type HabitsResponse = { habits: Habit[] };



function buildOptimisticHabit(

  payload: CreateHabitInput,

  opts: { existing?: Habit | null; sortOrder?: number; tempId?: string }

): Habit {

  const now = new Date().toISOString();

  if (opts.existing) {

    return {

      ...opts.existing,

      name: payload.name,

      icon: payload.icon,

      frequencyType: payload.frequencyType,

      weekdays: payload.weekdays ?? opts.existing.weekdays,

      timesPerWeek: payload.timesPerWeek ?? opts.existing.timesPerWeek,

      targetTime: payload.targetTime,

      endTime: payload.endTime ?? opts.existing.endTime,

      durationMinutes: payload.durationMinutes ?? opts.existing.durationMinutes,

      reminderEnabled: payload.reminderEnabled ?? opts.existing.reminderEnabled,

      subtasks: payload.subtasks ?? opts.existing.subtasks ?? [],

      updatedAt: now,

    };

  }



  return {

    id: opts.tempId ?? `temp-${Date.now()}`,

    name: payload.name,

    icon: payload.icon,

    frequencyType: payload.frequencyType,

    weekdays: payload.weekdays ?? [],

    timesPerWeek: payload.timesPerWeek ?? null,

    targetTime: payload.targetTime,

    endTime: payload.endTime ?? null,

    durationMinutes: payload.durationMinutes ?? null,

    reminderEnabled: payload.reminderEnabled ?? false,

    subtasks: payload.subtasks ?? [],

    archived: false,

    sortOrder: opts.sortOrder ?? 0,

    createdAt: now,

    updatedAt: now,

  };

}



export default function HabitsPage() {
  const { fetchWithAuth } = useAuth();

  const { data, loading, setCachedData } = useCachedQuery<HabitsResponse>(

    cacheKeys.habits,

    "/api/habits"

  );

  const habits = data?.habits ?? [];

  const [formOpen, setFormOpen] = useState(false);

  const [catalogOpen, setCatalogOpen] = useState(false);

  const [catalogDraft, setCatalogDraft] = useState<CreateHabitInput | null>(null);

  const [editing, setEditing] = useState<Habit | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    if (editId && habits.length > 0) {
      const habit = habits.find((h) => h.id === editId);
      if (habit) {
        setEditing(habit);
        setFormOpen(true);
      }
      return;
    }
    if (params.get("create") === "1") {
      setEditing(null);
      setCatalogDraft(null);
      setFormOpen(true);
    }
    if (params.get("catalog") === "1") {
      setCatalogOpen(true);
    }
  }, [habits]);

  const handleCreateOrUpdate = async (

    payload: CreateHabitInput | UpdateHabitInput

  ) => {

    const previous = data;

    const createPayload = payload as CreateHabitInput;



    if (editing) {

      const optimistic = buildOptimisticHabit(createPayload, {

        existing: editing,

      });

      setCachedData((prev) => ({

        habits: (prev?.habits ?? habits).map((h) =>

          h.id === editing.id ? optimistic : h

        ),

      }));

      setEditing(null);

      toast.success("Habit updated");

      invalidateCache("today:");



      try {

        const res = await fetchWithAuth(`/api/habits/${editing.id}`, {

          method: "PATCH",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify(payload),

        });

        const { habit } = await parseJson<{ habit: Habit }>(res);

        setCachedData((prev) => ({

          habits: (prev?.habits ?? habits).map((h) =>

            h.id === habit.id ? habit : h

          ),

        }));

        clearDirty(cacheKeys.habits);

      } catch {

        if (previous) setCachedData(previous);

        toast.error("Could not save habit");

      }

      return;

    }



    const tempId = `temp-${Date.now()}`;

    const optimistic = buildOptimisticHabit(createPayload, {

      tempId,

      sortOrder: habits.length,

    });

    setCachedData((prev) => ({

      habits: [...(prev?.habits ?? habits), optimistic],

    }));

    toast.success("Habit created");

    invalidateCache("today:");



    try {

      const res = await fetchWithAuth("/api/habits", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(payload),

      });

      const { habit } = await parseJson<{ habit: Habit }>(res);

      setCachedData((prev) => ({

        habits: (prev?.habits ?? habits).map((h) =>

          h.id === tempId ? habit : h

        ),

      }));

      clearDirty(cacheKeys.habits);

    } catch {

      if (previous) setCachedData(previous);

      toast.error("Could not create habit");

    }

  };



  const handleReorder = async (orderedIds: string[]) => {

    const previous = data;

    setCachedData((prev) => {

      const current = prev?.habits ?? habits;

      const map = new Map(current.map((h) => [h.id, h]));

      return {

        habits: orderedIds

          .map((id, index) => {

            const habit = map.get(id);

            return habit ? { ...habit, sortOrder: index } : null;

          })

          .filter(Boolean) as Habit[],

      };

    });



    try {

      const res = await fetchWithAuth("/api/habits/reorder", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ orderedIds }),

      });

      await parseJson(res);

      clearDirty(cacheKeys.habits);

    } catch {

      if (previous) setCachedData(previous);

      toast.error("Could not save order");

      throw new Error("Reorder failed");

    }

  };



  const handleArchive = async (habit: Habit, archived: boolean) => {

    const previous = data;

    setCachedData((prev) => ({

      habits: (prev?.habits ?? habits).map((h) =>

        h.id === habit.id ? { ...h, archived } : h

      ),

    }));

    toast.success(archived ? "Habit archived" : "Habit restored");

    invalidateCache("today:");



    try {

      const res = await fetchWithAuth(`/api/habits/${habit.id}`, {

        method: "PATCH",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ archived }),

      });

      await parseJson(res);

      clearDirty(cacheKeys.habits);

    } catch {

      if (previous) setCachedData(previous);

      toast.error("Could not update habit");

      throw new Error("Archive failed");

    }

  };



  const handleDelete = async (habit: Habit) => {

    const previous = data;

    setCachedData((prev) => ({

      habits: (prev?.habits ?? habits).filter((h) => h.id !== habit.id),

    }));

    toast.success("Habit deleted");

    invalidateCache("today:");



    try {

      const res = await fetchWithAuth(`/api/habits/${habit.id}`, {

        method: "DELETE",

      });

      if (!res.ok) {

        const err = await res.json();

        throw new Error(err.error ?? "Delete failed");

      }

      clearDirty(cacheKeys.habits);

    } catch {

      if (previous) setCachedData(previous);

      toast.error("Could not delete habit");

      throw new Error("Delete failed");

    }

  };



  return (

    <div className="pb-4">

      <header className="flex items-start justify-between px-5 pb-4 pt-8">

        <div>

          <h1 className="brand-title text-2xl font-semibold tracking-tight">

            Habits

          </h1>

          <p className="mt-1 text-sm text-gray-60/80">

            Customize, edit, and manage your routines.

          </p>

        </div>

        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => setCatalogOpen(true)}
            aria-label="Browse habit catalog"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            onClick={() => {
              setEditing(null);
              setCatalogDraft(null);
              setFormOpen(true);
            }}
            aria-label="Add habit"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

      </header>



      <Tabs defaultValue="active" className="px-5">

        <TabsList>

          <TabsTrigger value="active">Active</TabsTrigger>

          <TabsTrigger value="archived">Archived</TabsTrigger>

        </TabsList>



        <TabsContent value="active" className="mt-4 -mx-5">

          <HabitList

            habits={habits}

            loading={loading && !data}

            onReorder={handleReorder}

            onEdit={(h) => {

              setEditing(h);

              setFormOpen(true);

            }}

            onArchive={handleArchive}

            onDelete={handleDelete}

          />

        </TabsContent>



        <TabsContent value="archived" className="mt-4 -mx-5">

          <HabitList

            habits={habits}

            showArchived

            loading={loading && !data}

            onReorder={handleReorder}

            onEdit={(h) => {

              setEditing(h);

              setFormOpen(true);

            }}

            onArchive={handleArchive}

            onDelete={handleDelete}

          />

        </TabsContent>

      </Tabs>



      <HabitCatalogDialog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        onPick={(item: CatalogHabit) => {
          const { id: _id, category: _c, description: _d, ...draft } = item;
          void _id;
          void _c;
          void _d;
          setCatalogDraft(draft);
          setEditing(null);
          setFormOpen(true);
        }}
      />

      <HabitForm

        open={formOpen}

        onOpenChange={(open) => {

          setFormOpen(open);

          if (!open) {
            setEditing(null);
            setCatalogDraft(null);
          }

        }}

        habit={editing}

        initialDraft={catalogDraft}

        onSubmit={handleCreateOrUpdate}

      />

    </div>

  );

}


