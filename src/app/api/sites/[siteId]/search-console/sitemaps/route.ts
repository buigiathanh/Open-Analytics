import { NextResponse } from "next/server";
import { requireSiteOwner } from "@/lib/api/require-site-owner";
import { getValidGscAccessToken } from "@/lib/google/search-console-auth";
import {
  deleteSitemap,
  listSitemaps,
  mapGscSitemapForApi,
  submitSitemap,
} from "@/lib/google/search-console";

interface RouteContext {
  params: Promise<{ siteId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
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

  try {
    const sitemaps = await listSitemaps(
      token.accessToken,
      token.connection.site_url
    );
    return NextResponse.json({
      sitemaps: sitemaps.map(mapGscSitemapForApi),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not list sitemaps." },
      { status: 502 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { siteId } = await context.params;
  const auth = await requireSiteOwner(siteId);
  if (!auth.ok) return auth.response;

  let body: { feedpath?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const feedpath = body.feedpath?.trim();
  if (!feedpath) {
    return NextResponse.json({ error: "feedpath is required." }, { status: 400 });
  }

  const token = await getValidGscAccessToken(siteId);
  if (!token?.connection.site_url) {
    return NextResponse.json(
      { error: "Connect Google Search Console and select a property first." },
      { status: 400 }
    );
  }

  try {
    await submitSitemap(
      token.accessToken,
      token.connection.site_url,
      feedpath
    );
    return NextResponse.json({ submitted: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not submit sitemap." },
      { status: 502 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const { siteId } = await context.params;
  const auth = await requireSiteOwner(siteId);
  if (!auth.ok) return auth.response;

  const feedpath = new URL(request.url).searchParams.get("feedpath")?.trim();
  if (!feedpath) {
    return NextResponse.json({ error: "feedpath query param is required." }, { status: 400 });
  }

  const token = await getValidGscAccessToken(siteId);
  if (!token?.connection.site_url) {
    return NextResponse.json(
      { error: "Connect Google Search Console and select a property first." },
      { status: 400 }
    );
  }

  try {
    await deleteSitemap(
      token.accessToken,
      token.connection.site_url,
      feedpath
    );
    return NextResponse.json({ deleted: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not remove sitemap." },
      { status: 502 }
    );
  }
}
