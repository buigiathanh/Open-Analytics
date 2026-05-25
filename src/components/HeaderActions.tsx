"use client";

import { GetStartedButton } from "@/components/auth/GetStartedButton";
import { useAuth } from "@/components/auth/AuthProvider";

export function HeaderActions() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <button
          type="button"
          onClick={() => signOut()}
          className="hidden rounded-lg px-2.5 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 sm:inline dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          Sign out
        </button>
      ) : null}
      <GetStartedButton size="sm" className="rounded-lg px-3 py-1.5 text-sm" />
    </div>
  );
}
