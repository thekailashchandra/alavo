"use client";

import { cn } from "@/lib/utils";

type ProgressRingProps = {
  value: number;
  size?: number;
  stroke?: number;
  className?: string;
  trackClassName?: string;
  active?: boolean;
  showKnob?: boolean;
};

export function ProgressRing({
  value,
  size = 200,
  stroke = 14,
  className,
  trackClassName,
  active = false,
  showKnob = false,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;
  const gradientId = `ring-gradient-${size}-${stroke}`;

  const knobAngle = ((clamped / 100) * 360 - 90) * (Math.PI / 180);
  const knobX = center + radius * Math.cos(knobAngle);
  const knobY = center + radius * Math.sin(knobAngle);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("block", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A137FD" />
          <stop offset="50%" stopColor="#7B08E0" />
          <stop offset="100%" stopColor="#510594" />
        </linearGradient>
      </defs>

      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        className={cn("stroke-primary-20", trackClassName)}
      />

      {clamped > 0 && (
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          className={cn(
            "transition-[stroke-dashoffset] duration-500 ease-out",
            active && "drop-shadow-[0_0_8px_rgba(123,8,224,0.35)]"
          )}
        />
      )}

      {showKnob && clamped > 0 && clamped < 100 && (
        <circle
          cx={knobX}
          cy={knobY}
          r={stroke * 0.55}
          fill="#510594"
          className="drop-shadow-sm"
        />
      )}

    </svg>
  );
}
