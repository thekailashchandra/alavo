"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function TodayAddFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-gray-100/20 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="today-add-fab pointer-events-none fixed z-[60] flex flex-col items-end gap-3">
        {open && (
          <div className="pointer-events-auto flex flex-col items-end gap-2 pb-1">
            <Link
              href="/habits?create=1"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-full border border-gray-20 bg-white px-4 py-2.5 text-sm font-medium text-gray-100 shadow-lg shadow-primary-30/50 transition hover:bg-primary-20"
            >
              <Plus className="h-4 w-4 text-primary-100" />
              Create new habit
            </Link>
            <Link
              href="/habits?catalog=1"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-full border border-gray-20 bg-white px-4 py-2.5 text-sm font-medium text-gray-100 shadow-lg shadow-primary-30/50 transition hover:bg-primary-20"
            >
              <LayoutGrid className="h-4 w-4 text-primary-100" />
              Browse habit catalog
            </Link>
          </div>
        )}

        <button
          type="button"
          aria-label={open ? "Close add menu" : "Add habit"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-120 text-white shadow-lg shadow-primary-100/40 transition",
            "hover:scale-105 active:scale-95",
            open && "rotate-45"
          )}
        >
          {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </button>
      </div>
    </>
  );
}
