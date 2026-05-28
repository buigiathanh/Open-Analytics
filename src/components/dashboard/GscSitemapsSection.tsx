"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2, X } from "lucide-react";
import { SearchConsoleSitemapsSkeleton } from "./SearchConsoleSkeletons";

export type GscSitemapRow = {
  path: string;
  lastSubmitted: string | null;
  lastDownloaded: string | null;
  isPending: boolean;
  isSitemapsIndex: boolean;
  warnings: number;
  errors: number;
  type: string | null;
  discoveredPages: number;
  contents: { type: string; submitted: number }[];
};

type SitemapUrlDetail = {
  url: string;
  lastmod: string | null;
  inspection?: {
    verdict: string | null;
    coverageState: string | null;
    indexingState: string | null;
    lastCrawlTime: string | null;
    pageFetchState: string | null;
    indexed: boolean;
  };
};

type SitemapDetailResponse = {
  sitemap: GscSitemapRow;
  urls: { url: string; lastmod: string | null }[];
  urlsTruncated: boolean;
  urlsError: string | null;
  inspectionByUrl: Record<
    string,
    SitemapUrlDetail["inspection"] & object
  >;
  inspectionTruncated: boolean;
};

function formatGscDateTime(value: string | null): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return value.slice(0, 16);
  }
}

function urlDisplayTitle(url: string): string {
  try {
    const u = new URL(url);
    if (u.pathname === "/" || !u.pathname) return u.hostname;
    const path = decodeURIComponent(u.pathname);
    if (path.length <= 72) return path;
    return `${path.slice(0, 69)}…`;
  } catch {
    return url.length > 72 ? `${url.slice(0, 69)}…` : url;
  }
}

function indexStatusLabel(
  inspection: SitemapUrlDetail["inspection"] | undefined
): { label: string; className: string } {
  if (!inspection) {
    return {
      label: "Not checked",
      className:
        "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    };
  }
  if (inspection.indexed) {
    return {
      label: "Indexed",
      className:
        "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
    };
  }
  if (inspection.verdict === "NEUTRAL") {
    return {
      label: "Excluded",
      className:
        "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    };
  }
  if (inspection.verdict === "FAIL") {
    return {
      label: "Not indexed",
      className: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300",
    };
  }
  return {
    label: inspection.coverageState ?? "Unknown",
    className:
      "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  };
}

function SitemapStatusLine({ s }: { s: GscSitemapRow }) {
  const status =
    s.errors > 0
      ? `${s.errors} error${s.errors === 1 ? "" : "s"}`
      : s.warnings > 0
        ? `${s.warnings} warning${s.warnings === 1 ? "" : "s"}`
        : s.isPending
          ? "Pending"
          : "OK";

  return (
    <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-zinc-500">
      <span>
        <span className="text-zinc-400">Submitted</span>{" "}
        {formatGscDateTime(s.lastSubmitted)}
      </span>
      <span>
        <span className="text-zinc-400">Read</span>{" "}
        {formatGscDateTime(s.lastDownloaded)}
      </span>
      <span>
        <span className="text-zinc-400">Discovered</span>{" "}
        {s.discoveredPages.toLocaleString()} page
        {s.discoveredPages === 1 ? "" : "s"}
      </span>
      <span className={s.errors > 0 ? "text-red-600 dark:text-red-400" : ""}>
        {status}
      </span>
    </p>
  );
}

function DeleteSitemapDialog({
  path,
  loading,
  onCancel,
  onConfirm,
}: {
  path: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [loading, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gsc-delete-sitemap-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
        onClick={loading ? undefined : onCancel}
      />
      <div className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
        <h3
          id="gsc-delete-sitemap-title"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
        >
          Remove sitemap?
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This removes the sitemap from Google Search Console. It does not delete
          pages from your site.
        </p>
        <p className="mt-3 break-all rounded-lg bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {path}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Removing…
              </>
            ) : (
              "Remove"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function SitemapDetailDrawer({
  row,
  apiBase,
  onClose,
}: {
  row: GscSitemapRow;
  apiBase: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<SitemapDetailResponse | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiBase}/sitemaps/detail?feedpath=${encodeURIComponent(row.path)}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load sitemap details.");
        setDetail(null);
        return;
      }
      setDetail(data as SitemapDetailResponse);
    } catch {
      setError("Network error loading sitemap details.");
    } finally {
      setLoading(false);
    }
  }, [apiBase, row.path]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const urls: SitemapUrlDetail[] =
    detail?.urls.map((u) => ({
      url: u.url,
      lastmod: u.lastmod,
      inspection: detail.inspectionByUrl[u.url] as
        | SitemapUrlDetail["inspection"]
        | undefined,
    })) ?? [];

  const sm = detail?.sitemap ?? row;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[55] bg-black/30"
        aria-label="Close panel"
        onClick={onClose}
      />
      <aside
        className="fixed inset-y-0 right-0 z-[56] flex w-full max-w-lg flex-col border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gsc-sitemap-drawer-title"
      >
        <header className="shrink-0 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                id="gsc-sitemap-drawer-title"
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
              >
                Sitemap URLs
              </h3>
              <p className="mt-1 break-all text-xs text-zinc-500">{row.path}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Close"
            >
              <X className="size-5" strokeWidth={2} />
            </button>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-zinc-400">Submitted</dt>
              <dd className="mt-0.5 font-medium text-zinc-700 dark:text-zinc-300">
                {formatGscDateTime(sm.lastSubmitted)}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-400">Last read</dt>
              <dd className="mt-0.5 font-medium text-zinc-700 dark:text-zinc-300">
                {formatGscDateTime(sm.lastDownloaded)}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-400">Discovered pages</dt>
              <dd className="mt-0.5 font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
                {sm.discoveredPages.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-400">Type</dt>
              <dd className="mt-0.5 font-medium text-zinc-700 dark:text-zinc-300">
                {sm.type ?? "—"}
                {sm.isSitemapsIndex ? " · index" : ""}
              </dd>
            </div>
            {(sm.errors > 0 || sm.warnings > 0) && (
              <div className="col-span-2">
                <dt className="text-zinc-400">Issues</dt>
                <dd className="mt-0.5 font-medium text-zinc-700 dark:text-zinc-300">
                  {sm.errors > 0 ? `${sm.errors} errors` : null}
                  {sm.errors > 0 && sm.warnings > 0 ? " · " : null}
                  {sm.warnings > 0 ? `${sm.warnings} warnings` : null}
                </dd>
              </div>
            )}
          </dl>
          {sm.contents.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {sm.contents.map((c) => (
                <li
                  key={c.type}
                  className="rounded-md bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {c.type}: {c.submitted.toLocaleString()} URLs
                </li>
              ))}
            </ul>
          )}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
              <Loader2 className="size-4 animate-spin" />
              Loading URLs…
            </div>
          ) : error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          ) : detail?.urlsError && urls.length === 0 ? (
            <p className="text-sm text-zinc-500">{detail.urlsError}</p>
          ) : urls.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No URLs found in this sitemap file.
            </p>
          ) : (
            <ul className="space-y-4">
              {urls.map((entry) => {
                const status = indexStatusLabel(entry.inspection);
                return (
                  <li
                    key={entry.url}
                    className="border-b border-zinc-100 pb-4 last:border-0 dark:border-zinc-800"
                  >
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {urlDisplayTitle(entry.url)}
                    </p>
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block break-all text-xs text-emerald-700 hover:underline dark:text-emerald-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {entry.url}
                    </a>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                      {entry.inspection?.coverageState &&
                      entry.inspection.coverageState !== status.label ? (
                        <span className="text-[11px] text-zinc-500">
                          {entry.inspection.coverageState}
                        </span>
                      ) : null}
                    </div>
                    {(entry.lastmod ||
                      entry.inspection?.lastCrawlTime ||
                      entry.inspection?.pageFetchState) && (
                      <p className="mt-1.5 text-[11px] text-zinc-400">
                        {entry.lastmod
                          ? `Sitemap lastmod ${entry.lastmod.slice(0, 10)}`
                          : null}
                        {entry.lastmod && entry.inspection?.lastCrawlTime
                          ? " · "
                          : null}
                        {entry.inspection?.lastCrawlTime
                          ? `Crawled ${formatGscDateTime(entry.inspection.lastCrawlTime)}`
                          : null}
                        {entry.inspection?.pageFetchState
                          ? ` · ${entry.inspection.pageFetchState.replace(/_/g, " ").toLowerCase()}`
                          : null}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {!loading && !error && detail?.urlsTruncated && (
            <p className="mt-4 text-[11px] text-amber-700 dark:text-amber-400">
              Showing the first 500 URLs from this sitemap.
            </p>
          )}
          {!loading && detail?.inspectionTruncated && (
            <p className="mt-2 text-[11px] text-zinc-400">
              Index status checked for the first 30 URLs (Google URL Inspection
              quota).
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

export function GscSitemapsSection({ apiBase }: { apiBase: string }) {
  const [sitemaps, setSitemaps] = useState<GscSitemapRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [detailRow, setDetailRow] = useState<GscSitemapRow | null>(null);

  const loadSitemaps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/sitemaps`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load sitemaps.");
        setSitemaps([]);
        return;
      }
      setSitemaps(data.sitemaps ?? []);
    } catch {
      setError("Network error loading sitemaps.");
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    loadSitemaps();
  }, [loadSitemaps]);

  async function submitSitemap() {
    if (!sitemapUrl.trim()) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/sitemaps`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedpath: sitemapUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not submit sitemap.");
        return;
      }
      setSitemapUrl("");
      await loadSitemaps();
    } finally {
      setActionLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiBase}/sitemaps?feedpath=${encodeURIComponent(deleteTarget)}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not remove sitemap.");
        return;
      }
      if (detailRow?.path === deleteTarget) setDetailRow(null);
      setDeleteTarget(null);
      await loadSitemaps();
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          value={sitemapUrl}
          onChange={(e) => setSitemapUrl(e.target.value)}
          placeholder="https://example.com/sitemap.xml"
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="button"
          onClick={submitSitemap}
          disabled={actionLoading || !sitemapUrl.trim()}
          className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          Submit sitemap
        </button>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold dark:border-zinc-800">
          Submitted sitemaps
        </h3>
        {loading ? (
          <SearchConsoleSitemapsSkeleton />
        ) : sitemaps.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            No sitemaps yet
          </p>
        ) : (
          <ul className="divide-y divide-zinc-50 dark:divide-zinc-900">
            {sitemaps.map((s) => (
              <li
                key={s.path}
                className="flex items-start gap-2 px-4 py-3 text-sm"
              >
                <button
                  type="button"
                  onClick={() => setDetailRow(s)}
                  className="min-w-0 flex-1 rounded-lg text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                >
                  <p className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                    {s.path}
                  </p>
                  <SitemapStatusLine s={s} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(s.path)}
                  disabled={actionLoading}
                  className="mt-0.5 shrink-0 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  aria-label={`Remove sitemap ${s.path}`}
                >
                  <Trash2 className="size-4" strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {deleteTarget && (
        <DeleteSitemapDialog
          path={deleteTarget}
          loading={actionLoading}
          onCancel={() => !actionLoading && setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}

      {detailRow && (
        <SitemapDetailDrawer
          row={detailRow}
          apiBase={apiBase}
          onClose={() => setDetailRow(null)}
        />
      )}
    </div>
  );
}
