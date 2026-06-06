import { NextResponse } from "next/server";
import { fetchEventsForSite } from "@/lib/db/events";
import { isPostgresConfigured } from "@/lib/db/config";
import { getSiteForPublicShare } from "@/lib/registry-sites";
import { REALTIME_WINDOW_MS } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ siteId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  const { siteId } = await context.params;
  const site = await getSiteForPublicShare(siteId);
  if (!site) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const since = new Date(Date.now() - REALTIME_WINDOW_MS).toISOString();
  const events = await fetchEventsForSite(site.site_key, { since, limit: 500 });

  return NextResponse.json({ events });
}
