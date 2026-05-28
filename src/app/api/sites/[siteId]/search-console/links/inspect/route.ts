import { NextResponse } from "next/server";
import { requireSiteOwner } from "@/lib/api/require-site-owner";
import { upsertGscManagedLink } from "@/lib/google/gsc-links-db";
import { normalizeGscInspectionUrl } from "@/lib/google/gsc-url-normalize";
import { getValidGscAccessToken } from "@/lib/google/search-console-auth";
import { inspectUrlFull } from "@/lib/google/url-inspection";
import type { UrlInspectionFull } from "@/lib/google/url-inspection";

interface RouteContext {
  params: Promise<{ siteId: string }>;
}

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

/** Inspect a single URL (on-demand). Does not re-discover the full link list. */
export async function POST(request: Request, context: RouteContext) {
  const { siteId } = await context.params;
  const auth = await requireSiteOwner(siteId);
  if (!auth.ok) return auth.response;

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const normalized = normalizeGscInspectionUrl(
    body.url ?? "",
    auth.site.domain
  );
  if (!normalized) {
    return NextResponse.json(
      {
        error: `Enter a valid URL on ${auth.site.domain}.`,
      },
      { status: 400 }
    );
  }

  const token = await getValidGscAccessToken(siteId);
  if (!token?.connection.site_url) {
    return NextResponse.json(
      { error: "Connect Google Search Console and select a property first." },
      { status: 400 }
    );
  }

  const inspected = await inspectUrlFull(
    token.accessToken,
    token.connection.site_url,
    normalized
  );

  if ("error" in inspected) {
    return NextResponse.json({ error: inspected.error }, { status: 502 });
  }

  const now = new Date();
  await upsertGscManagedLink({
    projectId: siteId,
    url: normalized,
    inspection: inspected.inspection,
    inspectedAt: now,
  });

  return NextResponse.json({
    url: normalized,
    inspection: inspected.inspection,
    lastInspectedAt: now.toISOString(),
    issue: issueFromInspection(inspected.inspection),
  });
}
