import { NextResponse } from "next/server";
import { requireSiteOwner } from "@/lib/api/require-site-owner";
import { getValidGscAccessToken } from "@/lib/google/search-console-auth";
import { parseBreakdownMaxRows } from "@/lib/google/search-console-breakdown";
import {
  fetchBreakdownDimension,
  gscDateRange,
  querySearchAnalytics,
} from "@/lib/google/search-console";

interface RouteContext {
  params: Promise<{ siteId: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { siteId } = await context.params;
  const auth = await requireSiteOwner(siteId);
  if (!auth.ok) return auth.response;

  const token = await getValidGscAccessToken(siteId);
  if (!token?.connection.site_url) {
    return NextResponse.json(
      { error: "Connect Google Search Console and select a property first." },
      { status: 400 }
    );
  }

  const siteUrl = token.connection.site_url;
  const days = Math.min(
    90,
    Math.max(7, Number(new URL(request.url).searchParams.get("days") ?? 28))
  );
  const { startDate, endDate } = gscDateRange(days);
  const url = new URL(request.url);
  const breakdownMaxRows = parseBreakdownMaxRows(
    url.searchParams.get("breakdownRows")
  );

  function mapBreakdown(
    rows: { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number }[],
    labelKey = 0
  ) {
    return rows.map((r) => ({
      label: r.keys?.[labelKey] ?? "",
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: Math.round(r.ctr * 10000) / 100,
      position: Math.round(r.position * 10) / 10,
    }));
  }

  const breakdownOpts = {
    startDate,
    endDate,
    maxRows: breakdownMaxRows,
  };

  try {
    const [byDate, byQuery, byPage, byCountry, byDevice] = await Promise.all([
      querySearchAnalytics(token.accessToken, siteUrl, {
        startDate,
        endDate,
        dimensions: ["date"],
      }),
      fetchBreakdownDimension(token.accessToken, siteUrl, {
        ...breakdownOpts,
        dimension: "query",
      }),
      fetchBreakdownDimension(token.accessToken, siteUrl, {
        ...breakdownOpts,
        dimension: "page",
      }),
      fetchBreakdownDimension(token.accessToken, siteUrl, {
        ...breakdownOpts,
        dimension: "country",
      }),
      fetchBreakdownDimension(token.accessToken, siteUrl, {
        ...breakdownOpts,
        dimension: "device",
      }),
    ]);

    const totals = byDate.reduce(
      (acc, row) => ({
        clicks: acc.clicks + row.clicks,
        impressions: acc.impressions + row.impressions,
      }),
      { clicks: 0, impressions: 0 }
    );

    const avgCtr =
      totals.impressions > 0 ? totals.clicks / totals.impressions : 0;
    const avgPosition =
      byDate.length > 0
        ? byDate.reduce((s, r) => s + r.position, 0) / byDate.length
        : 0;

    return NextResponse.json({
      startDate,
      endDate,
      totals: {
        ...totals,
        ctr: Math.round(avgCtr * 10000) / 100,
        position: Math.round(avgPosition * 10) / 10,
      },
      byDate: byDate
        .map((r) => ({
          date: r.keys?.[0] ?? "",
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: Math.round(r.ctr * 10000) / 100,
          position: Math.round(r.position * 10) / 10,
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      breakdown: {
        query: mapBreakdown(byQuery.rows),
        page: mapBreakdown(byPage.rows),
        country: mapBreakdown(byCountry.rows),
        device: mapBreakdown(byDevice.rows),
      },
      breakdownMeta: {
        maxRows: breakdownMaxRows,
        query: { count: byQuery.rows.length, truncated: byQuery.truncated },
        page: { count: byPage.rows.length, truncated: byPage.truncated },
        country: { count: byCountry.rows.length, truncated: byCountry.truncated },
        device: { count: byDevice.rows.length, truncated: byDevice.truncated },
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not fetch analytics." },
      { status: 502 }
    );
  }
}
