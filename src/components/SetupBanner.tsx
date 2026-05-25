import {
  isAppServiceRoleConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase";

export function SetupBanner() {
  if (isSupabaseConfigured() && isAppServiceRoleConfigured()) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
      <p className="font-medium">App Supabase is not fully configured</p>
      <p className="mt-1 text-amber-800/90 dark:text-amber-200/80">
        Copy <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">.env.example</code> to{" "}
        <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">.env.local</code>:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-800/90 dark:text-amber-200/80">
        {!isSupabaseConfigured() && (
          <li>
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">NEXT_PUBLIC_SUPABASE_URL</code> +{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            (sign-in)
          </li>
        )}
        {!isAppServiceRoleConfigured() && (
          <li>
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            (app project Secret key — server saves sites after you sign in)
          </li>
        )}
      </ul>
      <p className="mt-2 text-amber-800/90 dark:text-amber-200/80">
        Run <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">supabase/schema-app.sql</code> on the app
        project in <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">.env</code>. For tracking data, use{" "}
        <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">schema-analytics.sql</code> on your own project (Add website).
      </p>
    </div>
  );
}
