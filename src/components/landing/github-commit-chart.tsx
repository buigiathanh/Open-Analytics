import type { GithubCommitWeek } from "@/lib/github";
import { cn } from "@/lib/utils";

const WEEKS_SHOWN = 26;

export function GithubCommitChart({ weeks }: { weeks: GithubCommitWeek[] }) {
  const slice = weeks.slice(-WEEKS_SHOWN);
  const max = Math.max(1, ...slice.map((w) => w.total));
  const total = slice.reduce((sum, w) => sum + w.total, 0);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold tabular-nums text-foreground">{total}</span>{" "}
          commits · last {WEEKS_SHOWN} weeks
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Less</span>
          <span className="inline-block size-2.5 rounded-sm bg-zinc-200 dark:bg-zinc-700" />
          <span
            className="inline-block size-2.5 rounded-sm bg-emerald-300 dark:bg-emerald-800"
            aria-hidden
          />
          <span
            className="inline-block size-2.5 rounded-sm bg-emerald-500"
            aria-hidden
          />
          <span
            className="inline-block size-2.5 rounded-sm bg-emerald-700 dark:bg-emerald-500"
            aria-hidden
          />
          <span>More</span>
        </div>
      </div>

      <div
        className="flex h-full min-h-[7rem] items-end gap-[3px] sm:gap-1"
        role="img"
        aria-label={`${WEEKS_SHOWN}-week commit chart, ${total} commits total`}
      >
        {slice.map((week) => {
          const heightPct = week.total === 0 ? 8 : 12 + (week.total / max) * 88;
          return (
            <div
              key={week.week}
              className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
              title={`${week.total} commits · ${formatWeek(week.week)}`}
            >
              <div
                className={cn(
                  "w-full rounded-sm transition-colors",
                  barClass(week.total, max)
                )}
                style={{ height: `${heightPct}%`, minHeight: "0.5rem" }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{formatWeek(slice[0]?.week ?? 0)}</span>
        <span>{formatWeek(slice[slice.length - 1]?.week ?? 0)}</span>
      </div>
    </div>
  );
}

function barClass(total: number, max: number): string {
  if (total === 0) return "bg-zinc-200 dark:bg-zinc-800";
  const ratio = total / max;
  if (ratio > 0.66) return "bg-emerald-600 dark:bg-emerald-500";
  if (ratio > 0.33) return "bg-emerald-500 dark:bg-emerald-600";
  return "bg-emerald-300 dark:bg-emerald-800";
}

function formatWeek(unixWeek: number): string {
  if (!unixWeek) return "";
  const d = new Date(unixWeek * 1000);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}
