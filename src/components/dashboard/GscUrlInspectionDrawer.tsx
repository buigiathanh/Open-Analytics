"use client";

import { useEffect } from "react";
import { ExternalLink, Loader2, RefreshCw, X } from "lucide-react";
import type { UrlInspectionFull } from "@/lib/google/url-inspection";
import { formatGscDateTime, IndexStatusBadge, urlDisplayTitle } from "./gsc-url-utils";

export function GscUrlInspectionDrawer({
  url,
  inspection,
  loading,
  error,
  onClose,
  onRefresh,
  refreshing,
}: {
  url: string;
  inspection: UrlInspectionFull | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  useEffectDrawerLock(onClose);

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
        aria-labelledby="gsc-url-drawer-title"
      >
        <header className="shrink-0 border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                id="gsc-url-drawer-title"
                className="font-medium text-zinc-900 dark:text-zinc-100"
              >
                {urlDisplayTitle(url)}
              </h3>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block break-all text-xs text-emerald-700 hover:underline dark:text-emerald-400"
              >
                {url}
              </a>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={refreshing || loading}
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-800"
                  aria-label="Refresh inspection"
                >
                  <RefreshCw
                    className={`size-4 ${refreshing ? "animate-spin" : ""}`}
                    strokeWidth={2}
                  />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Close"
              >
                <X className="size-5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
              <Loader2 className="size-4 animate-spin" />
              Inspecting URL…
            </div>
          ) : error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
              {error}
            </p>
          ) : inspection ? (
            <div className="space-y-6">
              <div>
                <IndexStatusBadge inspection={inspection} />
                {inspection.coverageState && (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {inspection.coverageState}
                  </p>
                )}
              </div>

              <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-zinc-400">Last crawled</dt>
                  <dd className="mt-0.5 font-medium text-zinc-700 dark:text-zinc-300">
                    {formatGscDateTime(inspection.lastCrawlTime)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-400">Page fetch</dt>
                  <dd className="mt-0.5 font-medium text-zinc-700 dark:text-zinc-300">
                    {inspection.pageFetchState?.replace(/_/g, " ").toLowerCase() ??
                      "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-400">Robots.txt</dt>
                  <dd className="mt-0.5 font-medium text-zinc-700 dark:text-zinc-300">
                    {inspection.robotsTxtState?.replace(/_/g, " ").toLowerCase() ??
                      "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-400">Indexing</dt>
                  <dd className="mt-0.5 font-medium text-zinc-700 dark:text-zinc-300">
                    {inspection.indexingState?.replace(/_/g, " ").toLowerCase() ??
                      "—"}
                  </dd>
                </div>
                {inspection.googleCanonical && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-zinc-400">Google canonical</dt>
                    <dd className="mt-0.5 break-all font-medium text-zinc-700 dark:text-zinc-300">
                      {inspection.googleCanonical}
                    </dd>
                  </div>
                )}
                {inspection.userCanonical && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-zinc-400">User canonical</dt>
                    <dd className="mt-0.5 break-all font-medium text-zinc-700 dark:text-zinc-300">
                      {inspection.userCanonical}
                    </dd>
                  </div>
                )}
              </dl>

              {inspection.sitemaps.length > 0 && (
                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Listed in sitemaps
                  </h4>
                  <ul className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {inspection.sitemaps.map((s) => (
                      <li key={s} className="break-all">
                        {s}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {inspection.referringUrls.length > 0 && (
                <section>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Referring URLs
                  </h4>
                  <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-zinc-600 dark:text-zinc-400">
                    {inspection.referringUrls.slice(0, 20).map((ref) => (
                      <li key={ref} className="break-all">
                        {ref}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {inspection.inspectionResultLink && (
                <a
                  href={inspection.inspectionResultLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                >
                  Open in Search Console
                  <ExternalLink className="size-3.5" strokeWidth={2} />
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No inspection data yet.</p>
          )}
        </div>
      </aside>
    </>
  );
}

function useEffectDrawerLock(onClose: () => void) {
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
}
