"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  GSC_DEFAULT_PAGE_SIZE,
  GSC_PAGE_SIZE_OPTIONS,
  type GscPageSize,
} from "@/lib/google/search-console-breakdown";
import { SearchConsoleTableSkeleton } from "./SearchConsoleSkeletons";

export type GscBreakdownRow = {
  label: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GscDimensionId = "query" | "page" | "country" | "device";

export type GscBreakdownMeta = {
  count: number;
  truncated: boolean;
};

const DIMENSION_TABS: { id: GscDimensionId; label: string; columnLabel: string }[] =
  [
    { id: "query", label: "Queries", columnLabel: "Query" },
    { id: "page", label: "Pages", columnLabel: "Page" },
    { id: "country", label: "Countries", columnLabel: "Country" },
    { id: "device", label: "Devices", columnLabel: "Device" },
  ];

type SortKey = "clicks" | "impressions" | "ctr" | "position";
type SortDir = "asc" | "desc";

const PAGE_SIZE_STORAGE_KEY = "oa-gsc-page-size";

function formatDeviceLabel(code: string): string {
  const map: Record<string, string> = {
    DESKTOP: "Desktop",
    MOBILE: "Mobile",
    TABLET: "Tablet",
  };
  return map[code.toUpperCase()] ?? code;
}

function formatRowLabel(id: GscDimensionId, label: string): string {
  if (id === "device") return formatDeviceLabel(label);
  if (id === "country") return label.toUpperCase();
  return label;
}

function readStoredPageSize(): GscPageSize {
  if (typeof window === "undefined") return GSC_DEFAULT_PAGE_SIZE;
  const raw = sessionStorage.getItem(PAGE_SIZE_STORAGE_KEY);
  const n = Number(raw);
  if (GSC_PAGE_SIZE_OPTIONS.includes(n as GscPageSize)) return n as GscPageSize;
  return GSC_DEFAULT_PAGE_SIZE;
}

function SortIcon({
  active,
  dir,
}: {
  active: boolean;
  dir: SortDir;
}) {
  if (!active) {
    return <ArrowUpDown className="size-3 opacity-40" strokeWidth={2} />;
  }
  return dir === "asc" ? (
    <ArrowUp className="size-3" strokeWidth={2} />
  ) : (
    <ArrowDown className="size-3" strokeWidth={2} />
  );
}

export function GscBreakdownTable({
  loading,
  breakdown,
  breakdownMeta,
}: {
  loading: boolean;
  breakdown: Record<GscDimensionId, GscBreakdownRow[]>;
  breakdownMeta?: Record<GscDimensionId, GscBreakdownMeta> | null;
}) {
  const [dimension, setDimension] = useState<GscDimensionId>("query");
  const [sortKey, setSortKey] = useState<SortKey>("clicks");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [pageSize, setPageSize] = useState<GscPageSize>(GSC_DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPageSize(readStoredPageSize());
  }, []);

  const activeTab = DIMENSION_TABS.find((t) => t.id === dimension)!;
  const rawRows = breakdown[dimension] ?? [];
  const meta = breakdownMeta?.[dimension];

  const sortedRows = useMemo(() => {
    const rows = [...rawRows];
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [rawRows, sortKey, sortDir]);

  const totalRows = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [dimension, sortKey, sortDir, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function onPageSizeChange(value: string) {
    const n = Number(value) as GscPageSize;
    setPageSize(n);
    sessionStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(n));
  }

  function sortableTh(key: SortKey, label: string, className = "") {
    const active = sortKey === key;
    return (
      <th className={`px-4 py-2 font-medium ${className}`}>
        <button
          type="button"
          onClick={() => toggleSort(key)}
          className={`inline-flex items-center gap-1 transition-colors hover:text-zinc-800 dark:hover:text-zinc-200 ${
            active ? "text-zinc-800 dark:text-zinc-200" : ""
          }`}
        >
          {label}
          <SortIcon active={active} dir={active ? sortDir : "desc"} />
        </button>
      </th>
    );
  }

  const rangeStart = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalRows);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Search breakdown
        </h3>
        <div className="flex flex-wrap gap-1 rounded-lg bg-zinc-100 p-0.5 dark:bg-zinc-800">
          {DIMENSION_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setDimension(t.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                dimension === t.id
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <SearchConsoleTableSkeleton />
      ) : totalRows === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-zinc-500">No data</p>
      ) : (
        <>
          <div className="max-h-[400px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-950">
                <tr className="border-b border-zinc-100 text-xs text-zinc-500 dark:border-zinc-800">
                  <th className="bg-white px-4 py-2 font-medium dark:bg-zinc-950">
                    {activeTab.columnLabel}
                  </th>
                  {sortableTh("clicks", "Clicks", "text-right bg-white dark:bg-zinc-950")}
                  {sortableTh(
                    "impressions",
                    "Impressions",
                    "text-right bg-white dark:bg-zinc-950"
                  )}
                  {sortableTh(
                    "ctr",
                    "CTR",
                    "hidden text-right sm:table-cell bg-white dark:bg-zinc-950"
                  )}
                  {sortableTh(
                    "position",
                    "Position",
                    "hidden text-right sm:table-cell bg-white dark:bg-zinc-950"
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((r) => (
                  <tr
                    key={`${dimension}-${page}-${r.label}`}
                    className="border-b border-zinc-50 last:border-0 dark:border-zinc-900"
                  >
                    <td
                      className="max-w-[280px] truncate px-4 py-2.5 font-medium text-zinc-800 dark:text-zinc-200"
                      title={formatRowLabel(dimension, r.label)}
                    >
                      {formatRowLabel(dimension, r.label)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                      {r.clicks.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                      {r.impressions.toLocaleString()}
                    </td>
                    <td className="hidden px-4 py-2.5 text-right tabular-nums text-zinc-500 sm:table-cell">
                      {r.ctr}%
                    </td>
                    <td className="hidden px-4 py-2.5 text-right tabular-nums text-zinc-500 sm:table-cell">
                      {r.position}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="gsc-page-size" className="text-zinc-500">
                Rows per page
              </label>
              <select
                id="gsc-page-size"
                value={pageSize}
                onChange={(e) => onPageSizeChange(e.target.value)}
                className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-800 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200"
              >
                {GSC_PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="tabular-nums">
                {rangeStart}–{rangeEnd} of {totalRows.toLocaleString()}
                {meta?.truncated ? "+" : ""}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-md border border-zinc-300 p-1.5 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-4" strokeWidth={2} />
                </button>
                <span className="min-w-[4.5rem] text-center tabular-nums">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-md border border-zinc-300 p-1.5 text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

          {meta?.truncated && (
            <p className="border-t border-zinc-50 px-4 py-2 text-[11px] text-amber-700 dark:border-zinc-900 dark:text-amber-400">
              Loaded up to the row cap from Google. There may be more rows in
              Search Console than shown here.
            </p>
          )}
        </>
      )}
    </div>
  );
}
