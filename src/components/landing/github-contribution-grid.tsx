import type { GithubCommitWeek } from "@/lib/github";
import { cn } from "@/lib/utils";

const WEEKS_SHOWN = 26;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function GithubContributionGrid({ weeks }: { weeks: GithubCommitWeek[] }) {
  const slice = weeks.slice(-WEEKS_SHOWN);
  const max = Math.max(
    1,
    ...slice.flatMap((w) => w.days ?? []).map((c) => c)
  );
  const total = slice.reduce((sum, w) => sum + w.total, 0);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold tabular-nums text-foreground">{total}</span>{" "}
          commits · source{" "}
          <span className="font-mono text-foreground">api.github.com</span>
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Less</span>
          {[0, 1, Math.ceil(max * 0.4), max].map((count, i) => (
            <span
              key={i}
              className={cn("size-2.5 rounded-sm", cellClass(count, max))}
              aria-hidden
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <div className="flex shrink-0 flex-col justify-between py-0.5 text-[9px] text-muted-foreground">
          {DAY_LABELS.map((label, i) => (
            <span
              key={label}
              className={cn("leading-none", i % 2 === 1 && "opacity-0 sm:opacity-100")}
            >
              {label}
            </span>
          ))}
        </div>

        <div
          className="inline-grid gap-[3px]"
          style={{
            gridTemplateRows: "repeat(7, minmax(0, 1fr))",
            gridAutoFlow: "column",
            gridAutoColumns: "minmax(0.625rem, 1fr)",
          }}
          role="img"
          aria-label={`${WEEKS_SHOWN}-week commit grid on repo, ${total} commits total`}
        >
          {slice.map((week) =>
            (week.days ?? [0, 0, 0, 0, 0, 0, 0]).map((count, dayIndex) => (
              <div
                key={`${week.week}-${dayIndex}`}
                className={cn(
                  "aspect-square min-w-[10px] rounded-[2px] sm:min-w-[12px]",
                  cellClass(count, max)
                )}
                title={`${count} commits · ${formatWeek(week.week)}`}
              />
            ))
          )}
        </div>
      </div>

      <div className="mt-2 flex justify-between pl-6 text-xs text-muted-foreground">
        <span>{formatWeek(slice[0]?.week ?? 0)}</span>
        <span>{formatWeek(slice[slice.length - 1]?.week ?? 0)}</span>
      </div>
    </div>
  );
}

function cellClass(count: number, max: number): string {
  if (count === 0) return "bg-zinc-100 dark:bg-zinc-800/80";
  const ratio = count / max;
  if (ratio > 0.75) return "bg-emerald-600 dark:bg-emerald-500";
  if (ratio > 0.5) return "bg-emerald-500 dark:bg-emerald-600";
  if (ratio > 0.25) return "bg-emerald-400 dark:bg-emerald-700";
  return "bg-emerald-300 dark:bg-emerald-800";
}

function formatWeek(unixWeek: number): string {
  if (!unixWeek) return "";
  const d = new Date(unixWeek * 1000);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
