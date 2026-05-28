import { NextResponse } from "next/server";
import { requireSiteOwner } from "@/lib/api/require-site-owner";
import { discoverGscUrls } from "@/lib/google/gsc-discover-urls";
import { getGscLinksCacheByUrl } from "@/lib/google/gsc-links-db";
import { getValidGscAccessToken } from "@/lib/google/search-console-auth";
import type { UrlInspectionFull } from "@/lib/google/url-inspection";

interface RouteContext {
  params: Promise<{ siteId: string }>;
}

export type GscIndexLinkPayload = {
  url: string;
  sources: ("sitemap" | "analytics")[];
  clicks: number | null;
  impressions: number | null;
  inspection: UrlInspectionFull | null;
  lastInspectedAt: string | null;
  issue: string | null;
};

function issueFromInspection(
  inspection: UrlInspectionFull | null
): string | null {
  if (!inspection) return null;
  if (inspection.indexed) return null;
  if (inspection.coverageState) return inspection.coverageState;
  if (inspection.pageFetchState && inspection.pageFetchState !== "SUCCESSFUL") {
    return inspection.pageFetchState.replace(/_/g, " ").toLowerCase();
  }
  if (inspection.verdict === "FAIL") return "Not indexed";
  return null;
}

function buildPayload(
  discovered: Awaited<ReturnType<typeof discoverGscUrls>>,
  cache: Map<string, { inspection: unknown; last_inspected_at: string | null }>
): GscIndexLinkPayload[] {
  return discovered.map((d) => {
    const cached = cache.get(d.url);
    const inspection = (cached?.inspection as UrlInspectionFull | null) ?? null;
    return {
      url: d.url,
      sources: d.sources,
      clicks: d.clicks ?? null,
      impressions: d.impressions ?? null,
      inspection,
      lastInspectedAt: cached?.last_inspected_at ?? null,
      issue: issueFromInspection(inspection),
    };
  });
}

function countByStatus(links: GscIndexLinkPayload[]) {
  let indexed = 0;
  let notIndexed = 0;
  let withIssues = 0;
  let unchecked = 0;

  for (const l of links) {
    if (!l.inspection) {
      unchecked++;
      continue;
    }
    if (l.inspection.indexed) indexed++;
    else if (l.issue) withIssues++;
    else notIndexed++;
  }

  return { indexed, notIndexed, withIssues, unchecked };
}

/** List URLs from Search Analytics (+ optional sitemaps). No bulk URL Inspection. */
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
  const params = new URL(request.url).searchParams;
  const includeSitemaps = params.get("includeSitemaps") === "1";

  try {
    const discovered = await discoverGscUrls(token.accessToken, siteUrl, {
      skipSitemaps: !includeSitemaps,
      maxAnalyticsPages: 150,
    });

    const urlList = discovered.map((d) => d.url);
    const cache = await getGscLinksCacheByUrl(siteId, urlList);
    const links = buildPayload(discovered, cache);
    const counts = countByStatus(links);

    return NextResponse.json({
      links,
      total: links.length,
      counts,
      sources: {
        fromSitemaps: discovered.filter((d) => d.sources.includes("sitemap"))
          .length,
        fromAnalytics: discovered.filter((d) =>
          d.sources.includes("analytics")
        ).length,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not load links." },
      { status: 502 }
    );
  }
}
