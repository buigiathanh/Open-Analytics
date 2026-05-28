import { NextResponse } from "next/server";
import { requireSiteOwner } from "@/lib/api/require-site-owner";
import { getValidGscAccessToken } from "@/lib/google/search-console-auth";
import {
  getSitemap,
  mapGscSitemapForApi,
} from "@/lib/google/search-console";
import { fetchSitemapUrls } from "@/lib/google/sitemap-xml";
import { inspectUrlsBatch } from "@/lib/google/url-inspection";

interface RouteContext {
  params: Promise<{ siteId: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { siteId } = await context.params;
  const auth = await requireSiteOwner(siteId);
  if (!auth.ok) return auth.response;

  const feedpath = new URL(request.url).searchParams.get("feedpath")?.trim();
  if (!feedpath) {
    return NextResponse.json(
      { error: "feedpath query param is required." },
      { status: 400 }
    );
  }

  const inspect = new URL(request.url).searchParams.get("inspect") !== "0";

  const token = await getValidGscAccessToken(siteId);
  if (!token?.connection.site_url) {
    return NextResponse.json(
      { error: "Connect Google Search Console and select a property first." },
      { status: 400 }
    );
  }

  const siteUrl = token.connection.site_url;

  try {
    const gscSitemap = await getSitemap(
      token.accessToken,
      siteUrl,
      feedpath
    );

    let urls: { url: string; lastmod: string | null }[] = [];
    let urlsTruncated = false;
    let urlsError: string | null = null;

    try {
      const parsed = await fetchSitemapUrls(feedpath, 500);
      urls = parsed.urls.map((u) => ({
        url: u.loc,
        lastmod: u.lastmod ?? null,
      }));
      urlsTruncated = parsed.truncated;
    } catch (e) {
      urlsError =
        e instanceof Error ? e.message : "Could not fetch sitemap XML.";
    }

    const inspectionByUrl: Record<
      string,
      {
        verdict: string | null;
        coverageState: string | null;
        indexingState: string | null;
        lastCrawlTime: string | null;
        pageFetchState: string | null;
        indexed: boolean;
      }
    > = {};

    let inspectionTruncated = false;
    if (inspect && urls.length > 0) {
      const inspected = await inspectUrlsBatch(
        token.accessToken,
        siteUrl,
        urls.map((u) => u.url)
      );
      for (const [url, summary] of inspected) {
        inspectionByUrl[url] = summary;
      }
      inspectionTruncated = urls.length > 30;
    }

    return NextResponse.json({
      sitemap: mapGscSitemapForApi(gscSitemap),
      urls,
      urlsTruncated,
      urlsError,
      inspectionByUrl,
      inspectionTruncated,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not load sitemap." },
      { status: 502 }
    );
  }
}
