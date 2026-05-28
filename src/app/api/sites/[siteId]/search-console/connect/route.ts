import { NextResponse } from "next/server";
import { requireSiteOwner } from "@/lib/api/require-site-owner";
import { resolveAppOrigin } from "@/lib/app-origin";
import { isGoogleSearchConsoleConfigured } from "@/lib/google/config";
import { buildGoogleAuthUrl, encodeOAuthState } from "@/lib/google/oauth";

interface RouteContext {
  params: Promise<{ siteId: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { siteId } = await context.params;
  const auth = await requireSiteOwner(siteId);
  if (!auth.ok) return auth.response;

  if (!isGoogleSearchConsoleConfigured()) {
    return NextResponse.json(
      {
        error:
          "Google Search Console OAuth is not configured. Set GOOGLE_SEARCH_CONSOLE_CLIENT_ID and GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET.",
      },
      { status: 503 }
    );
  }

  const origin = resolveAppOrigin(new URL(request.url).origin);
  const redirectUri = `${origin}/api/integrations/google/search-console/callback`;
  const state = encodeOAuthState({
    siteId,
    userId: auth.user.id,
    exp: Date.now() + 10 * 60 * 1000,
  });

  const url = buildGoogleAuthUrl(redirectUri, state);
  return NextResponse.redirect(url);
}
