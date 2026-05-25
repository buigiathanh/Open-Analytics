"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function PeriodSelector({ siteId }: { siteId: string }) {
  const searchParams = useSearchParams();
  const days = searchParams.get("days") === "30" ? 30 : 7;
  const base = `/app/${siteId}`;

  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-xs text-zinc-500">Period:</span>
      <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
        <Link
          href={base}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            days === 7
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          7 days
        </Link>
        <Link
          href={`${base}?days=30`}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            days === 30
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          30 days
        </Link>
      </div>
    </div>
  );
}
