import type { MetricWithTrend } from "@/lib/analytics";

export function MetricBar({ metrics }: { metrics: MetricWithTrend[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 sm:grid-cols-3 lg:grid-cols-5 dark:border-zinc-800 dark:bg-zinc-800">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="bg-white px-5 py-4 dark:bg-zinc-950"
        >
          <div className="flex items-center gap-2">
            {m.dot && (
              <span className={`h-2 w-2 rounded-full ${m.dot}`} />
            )}
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {m.label}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-100">
              {typeof m.value === "number" ? m.value.toLocaleString() : m.value}
            </span>
            {m.changePct != null && (
              <span
                className={`text-xs font-medium tabular-nums ${
                  m.changePct >= 0
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                {m.changePct >= 0 ? "+" : ""}
                {m.changePct}%
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
