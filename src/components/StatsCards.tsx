import type { SiteStats } from "@/lib/types";

interface StatsCardsProps {
  stats: SiteStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const items = [
    { label: "Visitors", value: stats.visitors.toLocaleString() },
    { label: "Visits", value: stats.visits.toLocaleString() },
    { label: "Pageviews", value: stats.pageviews.toLocaleString() },
    { label: "Bounce rate", value: `${stats.bounceRate}%` },
    { label: "Avg. visit time", value: formatDuration(stats.avgSessionSeconds) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <p className="text-sm text-zinc-500">{item.label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}
