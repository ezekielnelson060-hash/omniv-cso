"use client";

import { cn } from "@/lib/utils";

interface ChartLineProps {
  labels: string[];
  series: { name: string; data: number[]; color: string }[];
  className?: string;
  height?: number;
}

export function ChartLine({
  labels,
  series,
  className,
  height = 220,
}: ChartLineProps) {
  const w = 640;
  const h = height;
  const pad = { t: 16, r: 12, b: 28, l: 44 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  const all = series.flatMap((s) => s.data);
  const max = Math.max(...all, 1);
  const min = Math.min(...all, 0);
  const span = Math.max(1, max - min);

  const x = (i: number) =>
    pad.l + (labels.length <= 1 ? innerW / 2 : (i / (labels.length - 1)) * innerW);
  const y = (v: number) => pad.t + innerH - ((v - min) / span) * innerH;

  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((t) => pad.t + innerH * (1 - t));

  return (
    <div className={cn("w-full overflow-hidden", className)}>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img">
        {gridYs.map((gy, i) => (
          <line
            key={i}
            x1={pad.l}
            x2={w - pad.r}
            y1={gy}
            y2={gy}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        ))}

        {series.map((s) => {
          const pts = s.data
            .map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`)
            .join(" ");
          return (
            <g key={s.name}>
              <polyline
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pts}
              />
              {s.data.map((v, i) => (
                <circle
                  key={i}
                  cx={x(i)}
                  cy={y(v)}
                  r="2.5"
                  fill={s.color}
                  className="opacity-80"
                />
              ))}
            </g>
          );
        })}

        {labels.map((label, i) => {
          const step = labels.length > 10 ? 2 : 1;
          if (i % step !== 0 && i !== labels.length - 1) return null;
          return (
            <text
              key={label + i}
              x={x(i)}
              y={h - 8}
              textAnchor="middle"
              className="fill-[rgba(163,163,163,0.9)]"
              style={{ fontSize: 10 }}
            >
              {label}
            </text>
          );
        })}

        <text
          x={pad.l - 8}
          y={pad.t + 4}
          textAnchor="end"
          className="fill-[rgba(163,163,163,0.9)]"
          style={{ fontSize: 10 }}
        >
          {max >= 1000 ? `${(max / 1000).toFixed(0)}k` : max}
        </text>
        <text
          x={pad.l - 8}
          y={pad.t + innerH}
          textAnchor="end"
          className="fill-[rgba(163,163,163,0.9)]"
          style={{ fontSize: 10 }}
        >
          {min >= 1000 ? `${(min / 1000).toFixed(0)}k` : min}
        </text>
      </svg>

      <div className="mt-2 flex flex-wrap gap-4 px-1">
        {series.map((s) => (
          <span
            key={s.name}
            className="inline-flex items-center gap-1.5 text-xs text-omniv-text-muted"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: s.color }}
            />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
