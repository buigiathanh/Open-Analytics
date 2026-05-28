"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Site } from "@/lib/types";
import { SiteSettingsSection } from "./SiteSettingsSection";

function projectIdFromSite(site: Site): string {
  return site.supabase_project_id ?? site.supabase_url ?? "";
}

export function SiteGeneralSettings({ site }: { site: Site }) {
  const router = useRouter();
  const [name, setName] = useState(site.name);
  const [domain, setDomain] = useState(site.domain);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setError(null);

    if (!name.trim() || !domain.trim()) {
      setError("Fill in website name and domain.");
      return;
    }

    const projectId = projectIdFromSite(site);
    if (!projectId.trim()) {
      setError("Configure Supabase in Settings → Supabase first.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/sites/${site.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          domain,
          supabaseProjectId: projectId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save settings.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteSettingsSection
      title="General"
      description="Website name and domain shown in the dashboard."
    >
      <div className="max-w-md space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Website name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Blog"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Domain
          </label>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save changes"}
        </button>
      </div>
    </SiteSettingsSection>
  );
}
