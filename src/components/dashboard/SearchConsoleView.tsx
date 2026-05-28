"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Site } from "@/lib/types";
import {
  gscPeriodLabel,
  parseGscPeriodDays,
} from "@/lib/google/search-console-period";
import { SearchConsolePeriodSelector } from "./SearchConsolePeriodSelector";
import {
  GscBreakdownTable,
  type GscBreakdownMeta,
  type GscBreakdownRow,
  type GscDimensionId,
} from "./GscBreakdownTable";
import { GSC_DEFAULT_BREAKDOWN_MAX_ROWS } from "@/lib/google/search-console-breakdown";
import {
  SearchConsoleChartSkeleton,
  SearchConsoleMetricsSkeleton,
  SearchConsolePageSkeleton,
  SearchConsoleSitemapsSkeleton,
} from "./SearchConsoleSkeletons";

type ConnectionStatus = {
  connected: boolean;
  googleEmail: string | null;
  siteUrl: string | null;
  needsProperty: boolean;
  oauthConfigured: boolean;
};

type AnalyticsData = {
  startDate: string;
  endDate: string;
  totals: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  byDate: {
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }[];
  breakdown: Record<GscDimensionId, GscBreakdownRow[]>;
  breakdownMeta?: {
    maxRows: number;
    query: GscBreakdownMeta;
    page: GscBreakdownMeta;
    country: GscBreakdownMeta;
    device: GscBreakdownMeta;
  };
};

type SitemapRow = {
  path: string;
  lastSubmitted: string | null;
  lastDownloaded: string | null;
  isPending: boolean;
  warnings: number;
  errors: number;
  type: string | null;
};

type TabId = "performance" | "sitemaps";

const ERROR_MESSAGES: Record<string, string> = {
  denied: "Google access was denied. Try connecting again.",
  not_configured: "Google OAuth is not configured on the server.",
  no_refresh_token: "Could not get a refresh token. Revoke app access in Google Account and retry.",
  token_exchange: "Could not complete Google sign-in. Try again.",
  server: "Server error. Check SUPABASE_SERVICE_ROLE_KEY.",
};

export function SearchConsoleView({ site }: { site: Site }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("performance");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [sitemaps, setSitemaps] = useState<SitemapRow[]>([]);
  const [properties, setProperties] = useState<
    { siteUrl: string; permissionLevel: string }[]
  >([]);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const apiBase = `/api/sites/${site.id}/search-console`;
  const periodDays = parseGscPeriodDays(searchParams.get("days"));
  const periodLabel = gscPeriodLabel(periodDays);

  const loadStatus = useCallback(async () => {
    const res = await fetch(apiBase, { credentials: "include" });
    const data = await res.json();
    setStatus(data as ConnectionStatus);
    return data as ConnectionStatus;
  }, [apiBase]);

  const loadAnalytics = useCallback(async () => {
    setDataLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiBase}/analytics?days=${periodDays}&breakdownRows=${GSC_DEFAULT_BREAKDOWN_MAX_ROWS}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load analytics.");
        setAnalytics(null);
        return;
      }
      setAnalytics(data as AnalyticsData);
    } catch {
      setError("Network error loading analytics.");
    } finally {
      setDataLoading(false);
    }
  }, [apiBase, periodDays]);

  const loadSitemaps = useCallback(async () => {
    setDataLoading(true);
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
      setDataLoading(false);
    }
  }, [apiBase]);

  const loadProperties = useCallback(async () => {
    const res = await fetch(`${apiBase}/property`, { credentials: "include" });
    const data = await res.json();
    if (res.ok) {
      setProperties(data.properties ?? []);
    }
  }, [apiBase]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const s = await loadStatus();
      setLoading(false);
      if (s.connected && !s.needsProperty && s.siteUrl) {
        await loadAnalytics();
      }
      if (s.connected && s.needsProperty) {
        await loadProperties();
      }
    })();
  }, [loadStatus, loadAnalytics, loadProperties]);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err && ERROR_MESSAGES[err]) {
      setError(ERROR_MESSAGES[err]);
    }
    if (searchParams.get("pick_property") === "1") {
      loadProperties();
    }
  }, [searchParams, loadProperties]);

  useEffect(() => {
    if (!status?.connected || status.needsProperty || !status.siteUrl) return;
    if (tab === "performance") loadAnalytics();
    if (tab === "sitemaps") loadSitemaps();
  }, [tab, status, loadAnalytics, loadSitemaps]);

  function connectGoogle() {
    window.location.href = `${apiBase}/connect`;
  }

  async function disconnect() {
    if (!confirm("Disconnect Google Search Console for this website?")) return;
    setActionLoading(true);
    try {
      await fetch(apiBase, {
        method: "DELETE",
        credentials: "include",
      });
      setStatus({
        connected: false,
        googleEmail: null,
        siteUrl: null,
        needsProperty: false,
        oauthConfigured: status?.oauthConfigured ?? true,
      });
      setAnalytics(null);
      setSitemaps([]);
      router.refresh();
    } finally {
      setActionLoading(false);
    }
  }

  async function saveProperty() {
    if (!selectedProperty) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/property`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl: selectedProperty }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save property.");
        return;
      }
      setStatus((prev) =>
        prev
          ? { ...prev, siteUrl: selectedProperty, needsProperty: false }
          : prev
      );
      router.replace(`/app/${site.id}/search-console`);
      await loadAnalytics();
    } finally {
      setActionLoading(false);
    }
  }

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

  async function removeSitemap(feedpath: string) {
    if (!confirm(`Remove sitemap ${feedpath}?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(
        `${apiBase}/sitemaps?feedpath=${encodeURIComponent(feedpath)}`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) await loadSitemaps();
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <SearchConsolePageSkeleton />;
  }

  if (!status?.oauthConfigured) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/50 dark:bg-amber-950/30">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Search Console not configured
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Add{" "}
          <code className="text-xs">GOOGLE_SEARCH_CONSOLE_CLIENT_ID</code> and{" "}
          <code className="text-xs">GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET</code>{" "}
          to your server environment. Create a Google Cloud OAuth client with
          redirect URI{" "}
          <code className="text-xs break-all">
            {typeof window !== "undefined"
              ? `${window.location.origin}/api/integrations/google/search-console/callback`
              : "/api/integrations/google/search-console/callback"}
          </code>{" "}
          and enable the Search Console API.
        </p>
      </div>
    );
  }

  if (!status.connected) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <GoogleGIcon />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Connect Google Search Console
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
          Link the Google account that manages{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {site.domain}
          </span>{" "}
          to view impressions, clicks, sitemaps, and top pages from Search
          Console.
        </p>
        {error && (
          <p className="mx-auto mt-4 max-w-md rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={connectGoogle}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
        >
          <GoogleGIcon className="size-4" />
          Connect with Google
        </button>
        <p className="mt-4 text-xs text-zinc-400">
          We request read/write access to Search Console data and store a
          refresh token securely on the server.
        </p>
      </div>
    );
  }

  if (status.needsProperty || !status.siteUrl) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Select Search Console property
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Connected as {status.googleEmail ?? "Google account"}. Choose the
          property that matches this website.
        </p>
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          className="mt-4 w-full max-w-lg rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">Select property…</option>
          {properties.map((p) => (
            <option key={p.siteUrl} value={p.siteUrl}>
              {p.siteUrl} ({p.permissionLevel})
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={saveProperty}
            disabled={!selectedProperty || actionLoading}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {actionLoading ? "Saving…" : "Continue"}
          </button>
          <button
            type="button"
            onClick={disconnect}
            disabled={actionLoading}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  const chartData =
    analytics?.byDate.map((d) => ({
      label: d.date.slice(5),
      impressions: d.impressions,
      clicks: d.clicks,
    })) ?? [];

  const tabs: { id: TabId; label: string }[] = [
    { id: "performance", label: "Performance" },
    { id: "sitemaps", label: "Sitemaps" },
  ];

  const emptyBreakdown: Record<GscDimensionId, GscBreakdownRow[]> = {
    query: [],
    page: [],
    country: [],
    device: [],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Search Console
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {status.siteUrl}
            {status.googleEmail ? ` · ${status.googleEmail}` : null}
          </p>
        </div>
        <button
          type="button"
          onClick={disconnect}
          disabled={actionLoading}
          className="text-xs font-medium text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
        >
          Disconnect
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === "performance" && (
          <SearchConsolePeriodSelector siteId={site.id} />
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      {tab === "performance" && (
        <>
          {dataLoading ? (
            <SearchConsoleMetricsSkeleton />
          ) : analytics ? (
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 sm:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-800">
              {[
                { label: "Impressions", value: analytics.totals.impressions },
                { label: "Clicks", value: analytics.totals.clicks },
                { label: "CTR", value: `${analytics.totals.ctr}%` },
                {
                  label: "Avg. position",
                  value: analytics.totals.position,
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-white px-5 py-4 dark:bg-zinc-950"
                >
                  <span className="text-xs font-medium text-zinc-500">
                    {m.label}
                  </span>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {typeof m.value === "number"
                      ? m.value.toLocaleString()
                      : m.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {dataLoading ? (
            <div className="h-3 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          ) : analytics ? (
            <p className="text-xs text-zinc-500">
              {analytics.startDate} – {analytics.endDate} · {periodLabel} (Google
              Search results)
            </p>
          ) : null}

          {dataLoading ? (
            <SearchConsoleChartSkeleton />
          ) : analytics && chartData.length > 0 ? (
            <div className="h-[260px] rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="impressions"
                    name="Impressions"
                    stroke="#a1a1aa"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    name="Clicks"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : !dataLoading && analytics ? (
            <div className="flex h-[120px] items-center justify-center rounded-xl border border-zinc-200 bg-white text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950">
              No chart data for this period
            </div>
          ) : null}

          <GscBreakdownTable
            loading={dataLoading}
            breakdown={analytics?.breakdown ?? emptyBreakdown}
            breakdownMeta={analytics?.breakdownMeta ?? null}
          />
        </>
      )}

      {tab === "sitemaps" && dataLoading && <SearchConsoleSitemapsSkeleton />}

      {tab === "sitemaps" && !dataLoading && (
        <div className="space-y-4">
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
            {sitemaps.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">
                No sitemaps yet
              </p>
            ) : (
              <ul className="divide-y divide-zinc-50 dark:divide-zinc-900">
                {sitemaps.map((s) => (
                  <li
                    key={s.path}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-800 dark:text-zinc-200">
                        {s.path}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {s.errors > 0 || s.warnings > 0
                          ? `${s.errors} errors · ${s.warnings} warnings`
                          : s.isPending
                            ? "Pending"
                            : "OK"}
                        {s.lastSubmitted
                          ? ` · submitted ${s.lastSubmitted.slice(0, 10)}`
                          : null}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSitemap(s.path)}
                      disabled={actionLoading}
                      className="text-xs font-medium text-red-600 hover:text-red-500 dark:text-red-400"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

function GoogleGIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "size-6"} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
