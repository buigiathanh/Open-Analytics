import { NextResponse } from "next/server";
import { resolveAppOrigin } from "@/lib/app-origin";
import { isGoogleSearchConsoleConfigured } from "@/lib/google/config";
import {
  decodeOAuthState,
  exchangeCodeForTokens,
  fetchGoogleUserEmail,
} from "@/lib/google/oauth";
import { listGscSites, matchGscProperty } from "@/lib/google/search-console";
import { upsertGscConnection } from "@/lib/google/search-console-db";
import { getProjectForUser } from "@/lib/db/projects";
import { isPostgresConfigured } from "@/lib/db/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = resolveAppOrigin(url.origin);
  const siteIdFromQuery = url.searchParams.get("siteId");

  function redirect(path: string) {
    return NextResponse.redirect(`${origin}${path}`);
  }

  if (!isGoogleSearchConsoleConfigured()) {
    return redirect(
      siteIdFromQuery
        ? `/app/${siteIdFromQuery}/search-console?error=not_configured`
        : "/app?error=gsc_not_configured"
    );
  }

  const error = url.searchParams.get("error");
  if (error) {
    const stateRaw = url.searchParams.get("state");
    const state = stateRaw ? decodeOAuthState(stateRaw) : null;
    const sid = state?.siteId ?? siteIdFromQuery;
    return redirect(
      sid
        ? `/app/${sid}/search-console?error=denied`
        : "/app?error=gsc_denied"
    );
  }

  const code = url.searchParams.get("code");
  const stateRaw = url.searchParams.get("state");
  if (!code || !stateRaw) {
    return redirect("/app?error=gsc_invalid_callback");
  }

  const state = decodeOAuthState(stateRaw);
  if (!state) {
    return redirect("/app?error=gsc_invalid_state");
  }

  if (!isPostgresConfigured()) {
    return redirect(`/app/${state.siteId}/search-console?error=server`);
  }

  const project = await getProjectForUser(state.siteId, state.userId);

  if (!project) {
    return redirect("/app?error=gsc_site_not_found");
  }

  try {
    const redirectUri = `${origin}/api/integrations/google/search-console/callback`;
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    if (!tokens.refresh_token) {
      return redirect(
        `/app/${state.siteId}/search-console?error=no_refresh_token`
      );
    }

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    const email = await fetchGoogleUserEmail(tokens.access_token);

    let gscSiteUrl: string | null = null;
    try {
      const sites = await listGscSites(tokens.access_token);
      gscSiteUrl = matchGscProperty(sites, project.domain);
    } catch {
      /* property pick on dashboard */
    }

    await upsertGscConnection({
      projectId: state.siteId,
      userId: state.userId,
      googleEmail: email,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      siteUrl: gscSiteUrl,
    });

    const qs = gscSiteUrl ? "connected=1" : "connected=1&pick_property=1";
    return redirect(`/app/${state.siteId}/search-console?${qs}`);
  } catch {
    return redirect(`/app/${state.siteId}/search-console?error=token_exchange`);
  }
}
