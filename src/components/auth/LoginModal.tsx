"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Provider } from "@supabase/supabase-js";

import { getAppOrigin } from "@/lib/app-origin";
import {
  AUTH_SETUP_DOCS_PATH,
  authErrorMessage,
  authErrorSummary,
  authParamsFromHash,
  authParamsFromSearch,
} from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/browser";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

type OAuthProvider = Extract<Provider, "google" | "github">;

function readAuthErrorFromLocation(): {
  summary: string | null;
  isProviderProfile: boolean;
} {
  if (typeof window === "undefined") {
    return { summary: null, isProviderProfile: false };
  }
  const query = authParamsFromSearch(window.location.search);
  const fromQuery = authErrorSummary(query);
  if (fromQuery) {
    return {
      summary: fromQuery,
      isProviderProfile: authErrorMessage(query) === "provider_profile",
    };
  }
  const hashParams = authParamsFromHash(window.location.hash);
  if (!hashParams) return { summary: null, isProviderProfile: false };
  const desc = hashParams.get("error_description");
  if (desc) {
    return {
      summary: authErrorSummary(
        new URLSearchParams({
          error: "auth",
          reason: "provider_profile",
          detail: desc,
        })
      ),
      isProviderProfile: true,
    };
  }
  return { summary: null, isProviderProfile: false };
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [showAuthSetup, setShowAuthSetup] = useState(false);

  useEffect(() => {
    if (!open) return;
    const { summary, isProviderProfile } = readAuthErrorFromLocation();
    setError(summary);
    setShowAuthSetup(isProviderProfile);
  }, [open]);

  if (!open) return null;

  async function signInWith(provider: OAuthProvider) {
    setError(null);
    setLoadingProvider(provider);

    try {
      const supabase = createClient();
      const origin = getAppOrigin();
      const next =
        new URLSearchParams(window.location.search).get("next") || "/app";

      sessionStorage.setItem("oa_last_oauth_provider", provider);

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
          ...(provider === "google"
            ? {
                queryParams: {
                  access_type: "offline",
                  prompt: "consent",
                },
              }
            : {
                scopes: "read:user user:email",
              }),
        },
      });

      if (authError) {
        setError(authError.message);
        setLoadingProvider(null);
      }
    } catch {
      setError(
        provider === "github"
          ? "Could not start GitHub sign-in. Try again."
          : "Could not start Google sign-in. Try again."
      );
      setLoadingProvider(null);
    }
  }

  const loading = loadingProvider !== null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="login-modal-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Sign in to continue
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Sign in with Google or GitHub. Your account is stored in
              Supabase.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            <p>{error}</p>
            {showAuthSetup ? (
              <p className="mt-2">
                <Link
                  href={AUTH_SETUP_DOCS_PATH}
                  className="font-medium underline underline-offset-2"
                  onClick={onClose}
                >
                  Step-by-step OAuth setup
                </Link>
                {" "}
                (provider callback →{" "}
                <code className="text-xs break-all">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")}
                  /auth/v1/callback
                </code>
                )
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          <OAuthButton
            label="Continue with Google"
            icon={<GoogleIcon />}
            onClick={() => signInWith("google")}
            disabled={loading}
            loading={loadingProvider === "google"}
          />
          <OAuthButton
            label="Continue with GitHub"
            icon={<GitHubIcon />}
            onClick={() => signInWith("github")}
            disabled={loading}
            loading={loadingProvider === "github"}
          />
        </div>

        <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
          By continuing you agree to use Open Analytics with your account.
        </p>
      </div>
    </div>
  );
}

function OAuthButton({
  label,
  icon,
  onClick,
  disabled,
  loading,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
    >
      {icon}
      {loading ? "Redirecting…" : label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="size-5 text-zinc-900 dark:text-white" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
      />
    </svg>
  );
}
