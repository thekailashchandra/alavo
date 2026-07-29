import {
  BookOpen,
  Brain,
  Circle,
  Coffee,
  Dumbbell,
  Droplets,
  Flame,
  Heart,
  Moon,
  Music,
  PenLine,
  Salad,
  Sun,
  Target,
  Trees,
  Waves,
  type LucideIcon,
} from "lucide-react";

export const HABIT_ICONS: Record<string, LucideIcon> = {
  Circle,
  Flame,
  Droplets,
  Dumbbell,
  BookOpen,
  Brain,
  Coffee,
  Heart,
  Moon,
  Music,
  PenLine,
  Salad,
  Sun,
  Target,
  Trees,
  Waves,
};

export const HABIT_ICON_NAMES = Object.keys(HABIT_ICONS);

export function getHabitIcon(name: string): LucideIcon {
  return HABIT_ICONS[name] ?? Circle;
}
