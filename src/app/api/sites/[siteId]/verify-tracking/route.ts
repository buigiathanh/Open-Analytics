import { NextResponse } from "next/server";
import { isPostgresConfigured } from "@/lib/db/config";
import { hasEventsForSite } from "@/lib/db/events";
import { requireSiteOwner } from "@/lib/api/require-site-owner";

interface RouteContext {
  params: Promise<{ siteId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  const { siteId } = await context.params;
  const auth = await requireSiteOwner(siteId);
  if (!auth.ok) return auth.response;

  const verified = await hasEventsForSite(auth.site.site_key);

  return NextResponse.json({ verified });
}
