"use client";

import { useId } from "react";

export interface SparklinePoint {
  label: string;
  value: number;
}

function buildPaths(
  points: SparklinePoint[],
  width: number,
  height: number
): { line: string; area: string; last: { x: number; y: number } | null } {
  if (points.length === 0) {
    return { line: "", area: "", last: null };
  }

  const padding = { top: 10, right: 6, bottom: 2, left: 6 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const max = Math.max(...points.map((p) => p.value), 1);
  const baseline = padding.top + innerH;

  const coords = points.map((p, i) => ({
    x:
      padding.left +
      (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW),
    y: padding.top + innerH - (p.value / max) * innerH,
  }));

  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(" ");

  const first = coords[0];
  const last = coords[coords.length - 1];
  const area = `${line} L ${last.x.toFixed(2)} ${baseline.toFixed(2)} L ${first.x.toFixed(2)} ${baseline.toFixed(2)} Z`;

  return { line, area, last };
}

export function ProjectCardSparkline({ points }: { points: SparklinePoint[] }) {
  const gradientId = useId();
  const width = 320;
  const height = 72;
  const { line, area, last } = buildPaths(points, width, height);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[72px] w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <line
          x1={6}
          y1={height - 2}
          x2={width - 6}
          y2={height - 2}
          stroke="#d1fae5"
          strokeWidth={1}
        />
        {area ? (
          <path d={area} fill={`url(#${gradientId})`} stroke="none" />
        ) : null}
        {line ? (
          <path
            d={line}
            fill="none"
            stroke="#34d399"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {last ? (
          <circle
            cx={last.x}
            cy={last.y}
            r={3.5}
            fill="white"
            stroke="#34d399"
            strokeWidth={1.75}
          />
        ) : null}
      </svg>
      <div className="mt-1 flex justify-between gap-1 px-0.5">
        {points.map((p) => (
          <span
            key={p.label}
            className="min-w-0 flex-1 truncate text-center text-[10px] text-zinc-400"
          >
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
