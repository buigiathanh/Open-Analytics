import { NextResponse } from "next/server";
import { isPostgresConfigured } from "@/lib/db/config";
import { fetchEventsForSite } from "@/lib/db/events";
import { requireSiteOwner } from "@/lib/api/require-site-owner";

interface RouteContext {
  params: Promise<{ siteId: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  const { siteId } = await context.params;
  const auth = await requireSiteOwner(siteId);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const since = url.searchParams.get("since") ?? undefined;
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 5000;

  const events = await fetchEventsForSite(auth.site.site_key, {
    since,
    limit: Number.isFinite(limit) ? limit : 5000,
  });

  return NextResponse.json({ events });
}
