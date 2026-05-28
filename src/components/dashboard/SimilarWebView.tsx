"use client";

import { useCallback, useEffect, useState } from "react";
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
import type { SimilarWebInsights } from "@/lib/similarweb";
import {
  formatPercentShare,
  formatRank,
  formatVisitCount,
} from "@/lib/similarweb";

function ShareBars({
  items,
}: {
  items: { label: string; share: number; hint?: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-medium text-zinc-800 dark:text-zinc-200">
              {item.label}
              {item.hint ? (
                <span className="ml-1 font-normal text-zinc-500">
                  ({item.hint})
                </span>
              ) : null}
            </span>
            <span className="shrink-0 tabular-nums text-zinc-500">
              {formatPercentShare(item.share)}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500"
              style={{ width: `${Math.min(item.share * 100, 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function SimilarWebSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/60"
          />
        ))}
      </div>
      <div className="h-[260px] animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/60" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-48 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/60" />
        <div className="h-48 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/60" />
      </div>
    </div>
  );
}

function InsightsContent({ insights }: { insights: SimilarWebInsights }) {
  const chartData = insights.visitsOverTime.map((p) => ({
    label: p.label,
    visits: p.visits,
  }));

  const rankingCards: { label: string; value: string; detail?: string }[] = [];
  if (insights.ranking.globalRank != null) {
    rankingCards.push({
      label: "Global rank",
      value: `#${formatRank(insights.ranking.globalRank)}`,
    });
  }
  if (insights.ranking.countryRank != null) {
    rankingCards.push({
      label: insights.ranking.countryCode
        ? `${insights.ranking.countryCode} rank`
        : "Country rank",
      value: `#${formatRank(insights.ranking.countryRank)}`,
    });
  }
  if (insights.ranking.categoryRank != null) {
    rankingCards.push({
      label: "Category rank",
      value: `#${formatRank(insights.ranking.categoryRank)}`,
      detail: insights.ranking.category ?? undefined,
    });
  }

  const snapshotLabel = insights.snapshotDate
    ? new Date(insights.snapshotDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  return (
    <div className="space-y-8">
      {rankingCards.length > 0 && (
        <div className="grid gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 sm:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-800">
          {rankingCards.map((card) => (
            <div
              key={card.label}
              className="bg-white px-5 py-4 dark:bg-zinc-950"
            >
              <span className="text-xs font-medium text-zinc-500">
                {card.label}
              </span>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                {card.value}
              </p>
              {card.detail ? (
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                  {card.detail}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {chartData.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Estimated monthly visits
          </h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            Similarweb traffic estimates
            {snapshotLabel ? ` · snapshot ${snapshotLabel}` : null}
          </p>
          <div className="mt-4 h-[260px] rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
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
                  width={48}
                  tickFormatter={(v) => formatVisitCount(Number(v))}
                />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="visits"
                  name="Visits"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#059669" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {insights.geography.length > 0 && (
          <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Geography
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500">Share of visits by country</p>
            <div className="mt-4">
              <ShareBars
                items={insights.geography.map((g) => ({
                  label: g.countryName,
                  share: g.share,
                  hint: g.countryCode,
                }))}
              />
            </div>
          </section>
        )}

        {insights.trafficSources.length > 0 && (
          <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Traffic sources
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500">How visitors reach this site</p>
            <div className="mt-4">
              <ShareBars
                items={insights.trafficSources.map((s) => ({
                  label: s.label,
                  share: s.share,
                }))}
              />
            </div>
          </section>
        )}
      </div>

      {insights.topKeywords.length > 0 && (
        <section className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Top keywords
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500">
              Search terms driving traffic (Similarweb)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-xs text-zinc-500 dark:border-zinc-800">
                  <th className="px-5 py-2 font-medium">Keyword</th>
                  <th className="px-5 py-2 font-medium text-right">Volume</th>
                  <th className="px-5 py-2 font-medium text-right">Est. value</th>
                </tr>
              </thead>
              <tbody>
                {insights.topKeywords.map((kw) => (
                  <tr
                    key={kw.name}
                    className="border-b border-zinc-50 last:border-0 dark:border-zinc-900"
                  >
                    <td className="px-5 py-2.5 font-medium text-zinc-800 dark:text-zinc-200">
                      {kw.name}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                      {kw.volume != null ? formatVisitCount(kw.volume) : "—"}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                      {formatVisitCount(kw.estimatedValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="text-[11px] text-zinc-400">
        Traffic estimates from Similarweb public data. Figures are indicative and
        may be unavailable for newer or low-traffic sites.
      </p>
    </div>
  );
}

export function SimilarWebView({ site }: { site: Site }) {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<SimilarWebInsights | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sites/${site.id}/similarweb`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not load Similarweb data.");
        setInsights(null);
        return;
      }
      setInsights(data.insights ?? null);
      setMessage(data.message ?? null);
    } catch {
      setError("Network error loading Similarweb data.");
    } finally {
      setLoading(false);
    }
  }, [site.id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Similarweb
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Estimated audience and discovery signals for{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {site.domain}
          </span>
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <SimilarWebSkeleton />
      ) : insights ? (
        <InsightsContent insights={insights} />
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {message ??
              "No Similarweb data available for this domain. Try again later or check a higher-traffic site."}
          </p>
          <button
            type="button"
            onClick={load}
            className="mt-4 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
