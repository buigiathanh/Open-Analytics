import {
  isPostgresConfigured,
} from "@/lib/db/config";
import {
  isSupabaseConfigured,
} from "@/lib/supabase";

export function SetupBanner() {
  if (isSupabaseConfigured() && isPostgresConfigured()) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
      <p className="font-medium">App is not fully configured</p>
      <p className="mt-1 text-amber-800/90 dark:text-amber-200/80">
        Copy <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">.env.example</code> to{" "}
        <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">.env.local</code>:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-800/90 dark:text-amber-200/80">
        {!isSupabaseConfigured() && (
          <li>
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">NEXT_PUBLIC_SUPABASE_URL</code> +{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            (OAuth sign-in)
          </li>
        )}
        {!isPostgresConfigured() && (
          <li>
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">POSTGRES_URL</code>{" "}
            (PostgreSQL — run <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">supabase/schema-postgres.sql</code>)
          </li>
        )}
      </ul>
    </div>
  );
}
