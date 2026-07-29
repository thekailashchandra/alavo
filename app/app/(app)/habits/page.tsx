"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { HabitForm } from "@/components/habits/habit-form";
import { HabitList } from "@/components/habits/habit-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  parseJson,
  type CreateHabitInput,
  type Habit,
  type UpdateHabitInput,
} from "@/lib/api-client";

export default function HabitsPage() {
  const { fetchWithAuth } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);

  const loadHabits = useCallback(async () => {
    setLoading(true);
    try {
      const [activeRes, archivedRes] = await Promise.all([
        fetchWithAuth("/api/habits?archived=false"),
        fetchWithAuth("/api/habits?archived=true"),
      ]);
      const active = await parseJson<{ habits: Habit[] }>(activeRes);
      const archived = await parseJson<{ habits: Habit[] }>(archivedRes);
      setHabits([...active.habits, ...archived.habits]);
    } catch {
      toast.error("Could not load habits");
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    void loadHabits();
  }, [loadHabits]);

  const handleCreateOrUpdate = async (payload: CreateHabitInput | UpdateHabitInput) => {
    if (editing) {
      const res = await fetchWithAuth(`/api/habits/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await parseJson(res);
      toast.success("Habit updated");
    } else {
      const res = await fetchWithAuth("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await parseJson(res);
      toast.success("Habit created");
    }
    setEditing(null);
    void loadHabits();
  };

  const handleReorder = async (orderedIds: string[]) => {
    const res = await fetchWithAuth("/api/habits/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds }),
    });
    await parseJson(res);
    setHabits((prev) => {
      const map = new Map(prev.map((h) => [h.id, h]));
      return orderedIds
        .map((id, index) => {
          const habit = map.get(id);
          return habit ? { ...habit, sortOrder: index } : null;
        })
        .filter(Boolean) as Habit[];
    });
  };

  const handleArchive = async (habit: Habit, archived: boolean) => {
    const res = await fetchWithAuth(`/api/habits/${habit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived }),
    });
    await parseJson(res);
    void loadHabits();
  };

  const handleDelete = async (habit: Habit) => {
    const res = await fetchWithAuth(`/api/habits/${habit.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Delete failed");
    }
    void loadHabits();
  };

  return (
    <div className="pb-4">
      <header className="flex items-start justify-between px-5 pb-4 pt-8">
        <div>
          <h1 className="brand-title text-2xl font-semibold tracking-tight">
            Habits
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and reorder your routines.
          </p>
        </div>
        <Button
          size="icon"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          aria-label="Add habit"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </header>

      <Tabs defaultValue="active" className="px-5">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4 -mx-5">
          <HabitList
            habits={habits}
            loading={loading}
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
            loading={loading}
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

      <HabitForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        habit={editing}
        onSubmit={handleCreateOrUpdate}
      />
    </div>
  );
}
