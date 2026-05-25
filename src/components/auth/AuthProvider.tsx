"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { AuthLoginFromQuery } from "@/components/auth/AuthLoginFromQuery";
import type { User } from "@supabase/supabase-js";

import { LoginModal } from "@/components/auth/LoginModal";
import { createClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(
    () => (isSupabaseConfigured() ? createClient() : null),
    []
  );

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [loginOpen, setLoginOpen] = useState(false);

  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }, [supabase, router]);

  const value = useMemo(
    () => ({
      user,
      loading,
      loginOpen,
      openLogin,
      closeLogin,
      signOut,
    }),
    [user, loading, loginOpen, openLogin, closeLogin, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <AuthLoginFromQuery />
      </Suspense>
      {supabase ? (
        <LoginModal
          open={loginOpen}
          onClose={() => {
            closeLogin();
            if (
              pathname === "/" &&
              (window.location.search.includes("login=") ||
                window.location.search.includes("error=auth"))
            ) {
              router.replace("/");
            }
          }}
        />
      ) : null}
    </AuthContext.Provider>
  );
}
