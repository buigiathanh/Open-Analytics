"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Search } from "lucide-react";
import type { UrlInspectionFull } from "@/lib/google/url-inspection";
import { GscUrlInspectionDrawer } from "./GscUrlInspectionDrawer";
import {
  IndexStatusBadge,
  urlDisplayTitle,
} from "./gsc-url-utils";
import { SearchConsoleTableSkeleton } from "./SearchConsoleSkeletons";

export type GscIndexLink = {
  url: string;
  sources: ("sitemap" | "analytics")[];
  clicks: number | null;
  impressions: number | null;
  inspection: UrlInspectionFull | null;
  lastInspectedAt: string | null;
  issue: string | null;
};

type FilterId = "all" | "indexed" | "issues" | "not_indexed" | "unchecked";

type LinksResponse = {
  links: GscIndexLink[];
  total: number;
  counts: {
    indexed: number;
    notIndexed: number;
    withIssues: number;
    unchecked: number;
  };
  sources: { fromSitemaps: number; fromAnalytics: number };
};

type InspectOneResponse = {
  url: string;
  inspection: UrlInspectionFull;
  lastInspectedAt: string;
  issue: string | null;
  error?: string;
};

function matchesFilter(link: GscIndexLink, filter: FilterId): boolean {
  if (filter === "all") return true;
  if (filter === "unchecked") return !link.inspection;
  if (filter === "indexed") return link.inspection?.indexed === true;
  if (filter === "issues") return Boolean(link.issue);
  if (filter === "not_indexed") {
    return Boolean(link.inspection && !link.inspection.indexed);
  }
  return true;
}

function sourceLabel(sources: GscIndexLink["sources"]): string {
  if (sources.length === 2) return "Sitemap · Search";
  if (sources.includes("sitemap")) return "Sitemap";
  return "Search";
}

function recomputeCounts(links: GscIndexLink[]) {
  let indexed = 0;
  let notIndexed = 0;
  let withIssues = 0;
  let unchecked = 0;
  for (const l of links) {
    if (!l.inspection) unchecked++;
    else if (l.inspection.indexed) indexed++;
    else if (l.issue) withIssues++;
    else notIndexed++;
  }
  return { indexed, notIndexed, withIssues, unchecked };
}

export function GscLinksSection({ apiBase }: { apiBase: string }) {
  const [links, setLinks] = useState<GscIndexLink[]>([]);
  const [counts, setCounts] = useState<LinksResponse["counts"] | null>(null);
  const [sources, setSources] = useState<LinksResponse["sources"] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [listRefreshing, setListRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  const [detailUrl, setDetailUrl] = useState<GscIndexLink | null>(null);
  const [checkingUrl, setCheckingUrl] = useState<string | null>(null);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/links`, { credentials: "include" });
      const data = (await res.json()) as LinksResponse & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not load links.");
        setLinks([]);
        return;
      }
      setLinks(data.links);
      setCounts(data.counts);
      setSources(data.sources);
    } catch {
      setError("Network error loading links.");
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  async function refreshList() {
    setListRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/links`, { credentials: "include" });
      const data = (await res.json()) as LinksResponse & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not refresh links.");
        return;
      }
      setLinks(data.links);
      setCounts(data.counts);
      setSources(data.sources);
    } catch {
      setError("Network error refreshing links.");
    } finally {
      setListRefreshing(false);
    }
  }

  function mergeInspection(update: InspectOneResponse) {
    setLinks((prev) => {
      const next = prev.map((l) =>
        l.url === update.url
          ? {
              ...l,
              inspection: update.inspection,
              lastInspectedAt: update.lastInspectedAt,
              issue: update.issue,
            }
          : l
      );
      setCounts(recomputeCounts(next));
      return next;
    });
    setDetailUrl((prev) =>
      prev?.url === update.url
        ? {
            ...prev,
            inspection: update.inspection,
            lastInspectedAt: update.lastInspectedAt,
            issue: update.issue,
          }
        : prev
    );
  }

  async function checkIndex(link: GscIndexLink) {
    setCheckingUrl(link.url);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/links/inspect`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: link.url }),
      });
      const data = (await res.json()) as InspectOneResponse & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not inspect URL.");
        return;
      }
      mergeInspection(data);
    } catch {
      setError("Network error inspecting URL.");
    } finally {
      setCheckingUrl(null);
    }
  }

  const filtered = links.filter((l) => matchesFilter(l, filter));

  const filterTabs: { id: FilterId; label: string; count?: number }[] = [
    { id: "all", label: "All", count: links.length },
    { id: "indexed", label: "Indexed", count: counts?.indexed },
    { id: "issues", label: "Issues", count: counts?.withIssues },
    { id: "not_indexed", label: "Not indexed", count: counts?.notIndexed },
    { id: "unchecked", label: "Unchecked", count: counts?.unchecked },
  ];

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="text-xs text-zinc-500">
          <p>
            Pages from Search Console search data (last 28 days). Click the
            search icon to check index status for one URL (Google URL
            Inspection).
          </p>
          {sources && (
            <p className="mt-1">
              {sources.fromAnalytics} from search analytics
              {sources.fromSitemaps > 0
                ? ` · ${sources.fromSitemaps} from sitemaps`
                : null}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={refreshList}
          disabled={loading || listRefreshing}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          <RefreshCw
            className={`size-4 ${listRefreshing ? "animate-spin" : ""}`}
            strokeWidth={2}
          />
          Refresh list
        </button>
      </div>

      {counts && (
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === t.id
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {t.label}
              {t.count != null ? ` (${t.count})` : ""}
            </button>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold dark:border-zinc-800">
          Pages &amp; URLs
        </h3>
        {loading ? (
          <SearchConsoleTableSkeleton />
        ) : filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            {links.length === 0
              ? "No pages with search data yet. Check back after Google records impressions."
              : "No URLs match this filter."}
          </p>
        ) : (
          <div className="max-h-[480px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-white text-xs text-zinc-500 dark:bg-zinc-950">
                <tr className="border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-4 py-2 font-medium">Page</th>
                  <th className="px-4 py-2 font-medium">Index status</th>
                  <th className="hidden px-4 py-2 font-medium md:table-cell">
                    Issue
                  </th>
                  <th className="hidden px-4 py-2 font-medium sm:table-cell">
                    Source
                  </th>
                  <th className="w-12 px-2 py-2" aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((link) => {
                  const isChecking = checkingUrl === link.url;
                  return (
                    <tr
                      key={link.url}
                      className="border-b border-zinc-50 dark:border-zinc-900"
                    >
                      <td
                        className="max-w-[240px] cursor-pointer px-4 py-3"
                        onClick={() => setDetailUrl(link)}
                      >
                        <p className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                          {urlDisplayTitle(link.url)}
                        </p>
                        <p className="truncate text-xs text-zinc-500">
                          {link.url}
                        </p>
                      </td>
                      <td
                        className="cursor-pointer px-4 py-3"
                        onClick={() => setDetailUrl(link)}
                      >
                        <IndexStatusBadge inspection={link.inspection} />
                      </td>
                      <td
                        className="hidden max-w-[200px] cursor-pointer px-4 py-3 text-xs md:table-cell"
                        onClick={() => setDetailUrl(link)}
                      >
                        {link.issue ? (
                          <span className="text-amber-800 dark:text-amber-300">
                            {link.issue}
                          </span>
                        ) : link.inspection?.indexed ? (
                          <span className="text-zinc-400">—</span>
                        ) : link.inspection ? (
                          <span className="text-zinc-500">No issue reported</span>
                        ) : (
                          <span className="text-zinc-400">Not checked</span>
                        )}
                      </td>
                      <td
                        className="hidden cursor-pointer px-4 py-3 text-xs text-zinc-500 sm:table-cell"
                        onClick={() => setDetailUrl(link)}
                      >
                        {sourceLabel(link.sources)}
                        {link.clicks != null && link.clicks > 0 && (
                          <span className="mt-0.5 block tabular-nums">
                            {link.clicks.toLocaleString()} clicks
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            checkIndex(link);
                          }}
                          disabled={isChecking}
                          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                          aria-label={`Check index status for ${link.url}`}
                          title="Check index status"
                        >
                          {isChecking ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Search className="size-4" strokeWidth={2} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-[11px] text-zinc-400">
        Index checks use one URL Inspection call each (daily quota per property).
        Cached results are shown when you reload the list.
      </p>

      {detailUrl && (
        <GscUrlInspectionDrawer
          url={detailUrl.url}
          inspection={detailUrl.inspection}
          loading={checkingUrl === detailUrl.url}
          error={null}
          onClose={() => setDetailUrl(null)}
          onRefresh={() => checkIndex(detailUrl)}
          refreshing={checkingUrl === detailUrl.url}
        />
      )}
    </div>
  );
}
