import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { resolveAppOrigin } from "@/lib/app-origin";
import { authErrorFromOAuthCallback } from "@/lib/auth-errors";

function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/app";
  }
  return next;
}

function loginErrorRedirect(
  origin: string,
  reason: string,
  detail?: string
): NextResponse {
  const url = new URL("/", origin);
  url.searchParams.set("login", "1");
  url.searchParams.set("error", "auth");
  url.searchParams.set("reason", reason);
  if (detail) {
    url.searchParams.set("detail", detail.slice(0, 200));
  }
  return NextResponse.redirect(url.toString());
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const origin = resolveAppOrigin(requestUrl.origin);

  const oauthFailure = authErrorFromOAuthCallback(requestUrl.searchParams);
  if (oauthFailure) {
    return loginErrorRedirect(
      origin,
      oauthFailure.reason,
      oauthFailure.detail ?? undefined
    );
  }

  if (!code) {
    return loginErrorRedirect(origin, "no_code");
  }

  const redirectUrl = new URL(next, origin).toString();
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return loginErrorRedirect(origin, "exchange", error.message);
  }

  return response;
}
