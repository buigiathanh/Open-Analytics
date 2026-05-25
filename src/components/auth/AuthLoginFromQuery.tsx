"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  authErrorFromOAuthCallback,
  authParamsFromHash,
} from "@/lib/auth-errors";

/** Opens login modal when `?login=1` is present (requires Suspense boundary). */
export function AuthLoginFromQuery() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openLogin } = useAuth();

  useEffect(() => {
    const hashParams =
      typeof window !== "undefined"
        ? authParamsFromHash(window.location.hash)
        : null;
    const hashFailure = hashParams
      ? authErrorFromOAuthCallback(hashParams)
      : null;

    if (hashFailure && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.hash = "";
      url.searchParams.set("login", "1");
      url.searchParams.set("error", "auth");
      url.searchParams.set("reason", hashFailure.reason);
      if (hashFailure.detail) {
        url.searchParams.set("detail", hashFailure.detail.slice(0, 200));
      }
      router.replace(url.pathname + url.search);
      openLogin();
      return;
    }

    if (searchParams.get("login") === "1") {
      openLogin();
    }
  }, [searchParams, openLogin, router]);

  return null;
}
