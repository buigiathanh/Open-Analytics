import type { TimeSeriesPoint } from "@/lib/analytics";
import { getValidGscAccessToken } from "./search-console-auth";
import { getGscConnection } from "./search-console-db";
import { gscDateRange, querySearchAnalytics } from "./search-console";

export type GscDailyPoint = {
  date: string;
  clicks: number;
  impressions: number;
};

/** Fetch daily Search Console clicks for the stats chart (same period as dashboard). */
export async function getGscDailySeries(
  projectId: string,
  periodDays: number
): Promise<GscDailyPoint[] | null> {
  const connection = await getGscConnection(projectId);
  if (!connection?.site_url) return null;

  const token = await getValidGscAccessToken(projectId);
  const siteUrl = token?.connection.site_url;
  if (!token || !siteUrl) return null;

  const days = Math.min(90, Math.max(7, periodDays));
  const { startDate, endDate } = gscDateRange(days);

  try {
    const rows = await querySearchAnalytics(
      token.accessToken,
      siteUrl,
      {
        startDate,
        endDate,
        dimensions: ["date"],
        rowLimit: days + 7,
      }
    );

    return rows
      .map((r) => ({
        date: r.keys?.[0] ?? "",
        clicks: r.clicks,
        impressions: r.impressions,
      }))
      .filter((r) => r.date);
  } catch {
    return null;
  }
}

export function mergeGscIntoTimeSeries(
  series: TimeSeriesPoint[],
  gscByDate: GscDailyPoint[] | null
): TimeSeriesPoint[] {
  if (!gscByDate?.length) return series;

  const byDate = new Map(gscByDate.map((r) => [r.date, r.clicks]));

  return series.map((point) => ({
    ...point,
    gscClicks: byDate.get(point.date) ?? 0,
  }));
}

export async function isGscReadyForProject(projectId: string): Promise<boolean> {
  const connection = await getGscConnection(projectId);
  return Boolean(connection?.site_url);
}
