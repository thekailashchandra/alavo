import type { DayStatus } from "@/lib/habits";

export const statusClass: Record<DayStatus, string> = {
  completed: "bg-green-500 text-white border-green-600",
  missed_recent: "bg-amber-500 text-white border-amber-600",
  missed_long: "bg-red-500 text-white border-red-600",
  upcoming: "bg-gray-200 text-gray-500 border-gray-300",
  empty: "bg-gray-100 text-gray-400 border-gray-200",
};

export const statusTextClass: Record<DayStatus, string> = {
  completed: "text-green-600",
  missed_recent: "text-amber-500",
  missed_long: "text-red-600",
  upcoming: "text-gray-400",
  empty: "text-gray-400",
};

export const statusBorderClass: Record<DayStatus, string> = {
  completed: "border-l-green-500",
  missed_recent: "border-l-amber-500",
  missed_long: "border-l-red-500",
  upcoming: "border-l-gray-300",
  empty: "border-l-gray-200",
};

export const statusFill: Record<DayStatus, string> = {
  completed: "#22c55e",
  missed_recent: "#f59e0b",
  missed_long: "#ef4444",
  upcoming: "#d1d5db",
  empty: "#e5e7eb",
};

export const statusLabel: Record<DayStatus, string> = {
  completed: "Completed",
  missed_recent: "Missed recently",
  missed_long: "Broken streak",
  upcoming: "Upcoming",
  empty: "No data",
};
