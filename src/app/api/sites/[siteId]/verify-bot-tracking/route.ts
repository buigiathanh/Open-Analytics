import { NextResponse } from "next/server";
import { isPostgresConfigured } from "@/lib/db/config";
import { hasBotVisitsForSite } from "@/lib/db/bot-visits";
import { requireSiteOwner } from "@/lib/api/require-site-owner";
import {
  createVerificationChallenge,
  probeSiteForVerification,
  waitForVerification,
} from "@/lib/bot-verify-server";

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

  const verified = await hasBotVisitsForSite(auth.site.site_key);
  return NextResponse.json({ verified });
}

export async function POST(_request: Request, context: RouteContext) {
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  const { siteId } = await context.params;
  const auth = await requireSiteOwner(siteId);
  if (!auth.ok) return auth.response;

  const { site } = auth;
  const token = await createVerificationChallenge(site.site_key);
  const probe = await probeSiteForVerification(site.domain, token);
  if (!probe.ok) {
    return NextResponse.json({
      verified: false,
      error:
        probe.error ??
        "Could not reach your site. Check the domain and that middleware is deployed.",
    });
  }

  const verified = await waitForVerification(site.site_key);
  if (verified) {
    return NextResponse.json({
      verified: true,
      message: "Bot tracking verified — middleware is forwarding visits.",
    });
  }

  return NextResponse.json({
    verified: false,
    error:
      "No verification visit received. Add the middleware snippet, deploy, then try again.",
  });
}
