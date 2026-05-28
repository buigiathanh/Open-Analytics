import { NextResponse } from "next/server";
import { requireSiteOwner } from "@/lib/api/require-site-owner";
import { getValidGscAccessToken } from "@/lib/google/search-console-auth";
import { listGscSites } from "@/lib/google/search-console";
import { updateGscProperty } from "@/lib/google/search-console-db";

interface RouteContext {
  params: Promise<{ siteId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { siteId } = await context.params;
  const auth = await requireSiteOwner(siteId);
  if (!auth.ok) return auth.response;

  const token = await getValidGscAccessToken(siteId);
  if (!token) {
    return NextResponse.json({ error: "Not connected to Google." }, { status: 400 });
  }

  try {
    const sites = await listGscSites(token.accessToken);
    return NextResponse.json({
      properties: sites.map((s) => ({
        siteUrl: s.siteUrl,
        permissionLevel: s.permissionLevel,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not list properties." },
      { status: 502 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const { siteId } = await context.params;
  const auth = await requireSiteOwner(siteId);
  if (!auth.ok) return auth.response;

  let body: { siteUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const siteUrl = body.siteUrl?.trim();
  if (!siteUrl) {
    return NextResponse.json({ error: "siteUrl is required." }, { status: 400 });
  }

  const ok = await updateGscProperty(siteId, siteUrl);
  if (!ok) {
    return NextResponse.json({ error: "Could not save property." }, { status: 500 });
  }

  return NextResponse.json({ siteUrl });
}
