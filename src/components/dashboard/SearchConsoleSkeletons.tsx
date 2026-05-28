export function SearchConsoleMetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 sm:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-800">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white px-5 py-4 dark:bg-zinc-950">
          <div className="h-3 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-3 h-8 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

export function SearchConsoleChartSkeleton() {
  return (
    <div className="h-[260px] animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/60" />
  );
}

export function SearchConsoleTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="max-h-[400px] overflow-auto">
      <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-16 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-100 dark:border-zinc-800">
            <th className="px-4 py-2">
              <div className="h-3 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </th>
            {Array.from({ length: 4 }).map((_, i) => (
              <th key={i} className="px-4 py-2">
                <div className="ml-auto h-3 w-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-zinc-50 dark:border-zinc-900">
              <td className="px-4 py-3">
                <div className="h-4 w-full max-w-[200px] animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </td>
              {Array.from({ length: 4 }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <div className="ml-auto h-4 w-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SearchConsolePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
      <div className="h-10 w-64 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <SearchConsoleMetricsSkeleton />
      <div className="h-3 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <SearchConsoleChartSkeleton />
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <SearchConsoleTableSkeleton />
      </div>
    </div>
  );
}

export function SearchConsoleSitemapsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="h-10 min-w-0 flex-1 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <div className="h-4 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <ul className="divide-y divide-zinc-50 dark:divide-zinc-900">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="px-4 py-4">
              <div className="h-4 w-3/4 max-w-md animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="mt-2 h-3 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
