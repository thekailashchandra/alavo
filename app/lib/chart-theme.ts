/** Shared palette for analytics charts (matches brand primary scale). */
export const CHART = {
  line: "#7B08E0",
  lineLight: "#A137FD",
  fillTop: "#C685FE",
  fillBottom: "#F8F2FF",
  grid: "#E6E7F6",
  axis: "#A2A6C9",
  barTrack: "#F8F2FF",
  barTop: "#510594",
  barBottom: "#C685FE",
  todayLine: "#EF4444",
  tooltipBg: "#FFFFFF",
  tooltipBorder: "#E6E7F6",
} as const;

export type ChartRange = "7d" | "31d" | "26w" | "12m";

export const CHART_RANGES: { id: ChartRange; label: string }[] = [
  { id: "7d", label: "7 D" },
  { id: "31d", label: "31 D" },
  { id: "26w", label: "26 W" },
  { id: "12m", label: "12 M" },
];

export type ChartDataPoint = {
  label: string;
  rate: number;
  due: number;
  done: number;
  date?: string;
  isToday?: boolean;
};
