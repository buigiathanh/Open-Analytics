import { NextResponse } from "next/server";
import { requireSiteOwner } from "@/lib/api/require-site-owner";
import { getSimilarWebInsights } from "@/lib/similarweb";

interface RouteContext {
  params: Promise<{ siteId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { siteId } = await context.params;
  const auth = await requireSiteOwner(siteId);
  if (!auth.ok) return auth.response;

  const insights = await getSimilarWebInsights(auth.site.domain);

  if (!insights) {
    return NextResponse.json({
      insights: null,
      domain: auth.site.domain,
      message:
        "No Similarweb estimates for this domain. Common for new or low-traffic sites.",
    });
  }

  return NextResponse.json({ insights, domain: auth.site.domain });
}
