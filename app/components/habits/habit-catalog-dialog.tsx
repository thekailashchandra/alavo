"use client";

import { getHabitIcon } from "@/lib/icons";
import { HABIT_CATALOG, type CatalogHabit } from "@/lib/habit-catalog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type HabitCatalogDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (habit: CatalogHabit) => void;
};

export function HabitCatalogDialog({
  open,
  onOpenChange,
  onPick,
}: HabitCatalogDialogProps) {
  const categories = [...new Set(HABIT_CATALOG.map((h) => h.category))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Habit catalog</DialogTitle>
          <DialogDescription>
            Pick a starter habit — you can customize it before saving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {categories.map((category) => (
            <div key={category}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-60">
                {category}
              </p>
              <div className="grid gap-2">
                {HABIT_CATALOG.filter((h) => h.category === category).map(
                  (item) => {
                    const Icon = getHabitIcon(item.icon);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onPick(item);
                          onOpenChange(false);
                        }}
                        className="flex w-full items-start gap-3 rounded-2xl border border-gray-20 bg-white p-3 text-left transition hover:border-primary-30 hover:bg-primary-20/50"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-30 text-primary-100">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-100">
                            {item.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-60">
                            {item.description}
                          </span>
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
