import {
  fetchBreakdownDimension,
  gscDateRange,
  listSitemaps,
} from "@/lib/google/search-console";
import { fetchSitemapUrls } from "@/lib/google/sitemap-xml";

export type DiscoveredGscUrl = {
  url: string;
  sources: ("sitemap" | "analytics")[];
  clicks?: number;
  impressions?: number;
};

const MAX_SITEMAP_URLS = 400;
const MAX_ANALYTICS_PAGES = 200;
const MAX_SITEMAP_FEEDS = 15;

export async function discoverGscUrls(
  accessToken: string,
  siteUrl: string,
  opts?: {
    analyticsDays?: number;
    /** Skip sitemap XML fetches (faster; use for Links tab). */
    skipSitemaps?: boolean;
    maxAnalyticsPages?: number;
  }
): Promise<DiscoveredGscUrl[]> {
  const days = opts?.analyticsDays ?? 28;
  const maxAnalytics = opts?.maxAnalyticsPages ?? MAX_ANALYTICS_PAGES;
  const { startDate, endDate } = gscDateRange(days);
  const byUrl = new Map<string, DiscoveredGscUrl>();

  function add(
    url: string,
    source: "sitemap" | "analytics",
    metrics?: { clicks: number; impressions: number }
  ) {
    const normalized = url.trim();
    if (!normalized) return;
    const existing = byUrl.get(normalized);
    if (existing) {
      if (!existing.sources.includes(source)) existing.sources.push(source);
      if (metrics) {
        existing.clicks = metrics.clicks;
        existing.impressions = metrics.impressions;
      }
      return;
    }
    byUrl.set(normalized, {
      url: normalized,
      sources: [source],
      clicks: metrics?.clicks,
      impressions: metrics?.impressions,
    });
  }

  if (!opts?.skipSitemaps) {
    try {
      const sitemaps = await listSitemaps(accessToken, siteUrl);
      let urlBudget = MAX_SITEMAP_URLS;
      for (const sm of sitemaps.slice(0, MAX_SITEMAP_FEEDS)) {
        if (urlBudget <= 0) break;
        try {
          const { urls } = await fetchSitemapUrls(sm.path, urlBudget);
          for (const u of urls) {
            add(u.loc, "sitemap");
            urlBudget--;
            if (urlBudget <= 0) break;
          }
        } catch {
          /* skip unreachable sitemap */
        }
      }
    } catch {
      /* sitemaps optional */
    }
  }

  try {
    const { rows } = await fetchBreakdownDimension(accessToken, siteUrl, {
      startDate,
      endDate,
      dimension: "page",
      maxRows: maxAnalytics,
    });
    for (const r of rows) {
      const pageUrl = r.keys?.[0];
      if (!pageUrl) continue;
      add(pageUrl, "analytics", {
        clicks: r.clicks,
        impressions: r.impressions,
      });
    }
  } catch {
    /* analytics optional */
  }

  return Array.from(byUrl.values()).sort((a, b) => {
    const ac = a.clicks ?? 0;
    const bc = b.clicks ?? 0;
    if (bc !== ac) return bc - ac;
    return a.url.localeCompare(b.url);
  });
}
