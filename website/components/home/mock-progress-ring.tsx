type MockProgressRingProps = {
  value: number;
  size?: number;
  stroke?: number;
  active?: boolean;
  showKnob?: boolean;
  label?: string;
};

export function MockProgressRing({
  value,
  size = 40,
  stroke = 3,
  active = false,
  showKnob = false,
  label,
}: MockProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;
  const gradientId = `mock-ring-${size}-${stroke}-${value}`;

  const knobAngle = ((clamped / 100) * 360 - 90) * (Math.PI / 180);
  const knobX = center + radius * Math.cos(knobAngle);
  const knobY = center + radius * Math.sin(knobAngle);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
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
          stroke="#E6E7F6"
          strokeWidth={stroke}
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
            className={active ? "drop-shadow-[0_0_6px_rgba(123,8,224,0.35)]" : undefined}
          />
        )}

        {showKnob && clamped > 0 && clamped < 100 && (
          <circle cx={knobX} cy={knobY} r={stroke * 0.55} fill="#510594" />
        )}
      </svg>

      {label ? (
        <span
          className={`absolute text-[10px] font-semibold ${
            active ? "text-[var(--primary)]" : "text-[var(--alavo-gray-60)]"
          }`}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
