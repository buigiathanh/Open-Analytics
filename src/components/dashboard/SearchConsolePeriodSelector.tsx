"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  GSC_PERIOD_OPTIONS,
  parseGscPeriodDays,
} from "@/lib/google/search-console-period";

function buildHref(siteId: string, days: number, searchParams: URLSearchParams) {
  const params = new URLSearchParams(searchParams.toString());
  if (days === 28) {
    params.delete("days");
  } else {
    params.set("days", String(days));
  }
  const qs = params.toString();
  const base = `/app/${siteId}/search-console`;
  return qs ? `${base}?${qs}` : base;
}

export function SearchConsolePeriodSelector({ siteId }: { siteId: string }) {
  const searchParams = useSearchParams();
  const activeDays = parseGscPeriodDays(searchParams.get("days"));

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-500">Date range:</span>
      <div className="inline-flex rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700">
        {GSC_PERIOD_OPTIONS.map((opt) => (
          <Link
            key={opt.days}
            href={buildHref(siteId, opt.days, searchParams)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeDays === opt.days
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
