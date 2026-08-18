"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type HabitToggleProps = {
  checked: boolean;
  busy?: boolean;
  label: string;
  onToggle: () => void;
};

export function HabitToggle({
  checked,
  busy,
  label,
  onToggle,
}: HabitToggleProps) {
  const lockRef = useRef(false);

  const handleActivate = () => {
    if (busy || lockRef.current) return;
    lockRef.current = true;
    onToggle();
    window.setTimeout(() => {
      lockRef.current = false;
    }, 280);
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      aria-busy={busy}
      disabled={busy}
      onClick={(event) => {
        event.stopPropagation();
        handleActivate();
      }}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          event.stopPropagation();
          handleActivate();
        }
      }}
      className={cn(
        "group relative z-30 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 transition-all duration-200",
        "cursor-pointer touch-manipulation select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-100 focus-visible:ring-offset-2",
        "hover:scale-[1.04] active:scale-95",
        checked
          ? "border-transparent bg-gradient-to-br from-primary-100 to-primary-120 text-white shadow-md shadow-primary-100/35"
          : "border-primary-30 bg-white text-transparent shadow-sm hover:border-primary-60 hover:bg-primary-10",
        busy && "pointer-events-none opacity-70"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-[3px] rounded-[0.65rem] transition-opacity duration-200",
          checked ? "opacity-0" : "opacity-100 bg-gradient-to-br from-primary-20/80 to-transparent"
        )}
      />

      <Check
        className={cn(
          "relative h-5 w-5 transition-all duration-200",
          checked
            ? "scale-100 opacity-100"
            : "scale-75 opacity-0 group-hover:opacity-20"
        )}
        strokeWidth={3}
      />

      {busy && (
        <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/20">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </span>
      )}
    </button>
  );
}
