import { NextResponse } from "next/server";
import { requireSiteOwner } from "@/lib/api/require-site-owner";
import { isGoogleSearchConsoleConfigured } from "@/lib/google/config";
import {
  deleteGscConnection,
  getGscConnection,
  toPublicConnection,
} from "@/lib/google/search-console-db";

interface RouteContext {
  params: Promise<{ siteId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { siteId } = await context.params;
  const auth = await requireSiteOwner(siteId);
  if (!auth.ok) return auth.response;

  const row = await getGscConnection(siteId);
  return NextResponse.json({
    ...toPublicConnection(row),
    oauthConfigured: isGoogleSearchConsoleConfigured(),
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { siteId } = await context.params;
  const auth = await requireSiteOwner(siteId);
  if (!auth.ok) return auth.response;

  const ok = await deleteGscConnection(siteId);
  if (!ok) {
    return NextResponse.json(
      {
        error:
          "Could not disconnect. Run supabase/migrations/add-google-search-console.sql on your app database.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ disconnected: true });
}
