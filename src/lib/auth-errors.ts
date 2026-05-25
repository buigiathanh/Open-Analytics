/** Parse auth error params from OAuth redirect (query or hash). */

export type AuthErrorParams = {
  reason: string;
  detail: string | null;
};

function decodeParam(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

export function authParamsFromSearch(search: string): URLSearchParams {
  return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
}

export function authParamsFromHash(hash: string): URLSearchParams | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return null;
  const params = new URLSearchParams(raw);
  if (
    params.get("error") ||
    params.get("error_description") ||
    params.get("error_code")
  ) {
    return params;
  }
  return null;
}

/** Map Supabase OAuth callback errors to app `reason` + `detail`. */
export function authErrorFromOAuthCallback(
  params: URLSearchParams
): AuthErrorParams | null {
  const oauthError = params.get("error");
  if (!oauthError) return null;

  const description = decodeParam(params.get("error_description"));
  const code = params.get("error_code");

  if (oauthError === "access_denied") {
    return { reason: "oauth_denied", detail: description };
  }

  if (
    oauthError === "server_error" ||
    description?.toLowerCase().includes("user profile from external provider")
  ) {
    return {
      reason: "provider_profile",
      detail: description ?? code ?? oauthError,
    };
  }

  return {
    reason: "oauth_error",
    detail: description ?? code ?? oauthError,
  };
}

export const AUTH_SETUP_DOCS_PATH = "/docs/auth";

import { getAppOrigin } from "@/lib/app-origin";

/** Short message for login UI; full steps are on /docs/auth */
export function authErrorSummary(params: URLSearchParams): string | null {
  const code = authErrorMessage(params);
  if (!code) return null;
  if (code === "provider_profile") {
    return "Supabase could not read your account from Google or GitHub. This is almost always provider credentials or email permissions — not the app callback.";
  }
  return code;
}

export function authErrorMessage(params: URLSearchParams): string | null {
  if (params.get("error") !== "auth") return null;

  const reason = params.get("reason");
  const detail = params.get("detail");

  if (
    reason === "provider_profile" ||
    detail?.toLowerCase().includes("user profile from external provider") ||
    detail?.toLowerCase().includes("user email from external provider")
  ) {
    return "provider_profile";
  }

  switch (reason) {
    case "oauth_denied":
      return "Sign-in was cancelled. Try again when you're ready.";
    case "no_code":
      return (
        "No authorization code returned. Add this URL to Supabase Redirect URLs: " +
        `${getAppOrigin()}/auth/callback`
      );
    case "exchange":
      return (
        detail ??
        "Could not create a session. Ensure Redirect URLs include your app /auth/callback and that NEXT_PUBLIC_APP_URL matches the port you use in the browser."
      );
    case "oauth_error":
      return (
        detail ??
        "Sign-in failed at the provider. Check Supabase Auth logs and provider credentials."
      );
    default:
      return (
        detail ??
        "Sign-in failed. In Supabase: enable Google/GitHub provider, set Redirect URLs to {your-origin}/auth/callback, and match NEXT_PUBLIC_APP_URL to that origin."
      );
  }
}
