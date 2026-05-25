"use client";

import { type ReactNode } from "react";

import { AuthProvider } from "@/components/auth/AuthProvider";

export function AuthProviderBoundary({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
