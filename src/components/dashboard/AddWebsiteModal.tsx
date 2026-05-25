"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ANALYTICS_SCHEMA_FULL_SQL } from "@/lib/analytics-schema-sql";
import { buildTrackerSnippet } from "@/lib/tracker-snippet";

interface AddWebsiteModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

type CreatedProject = {
  id: string;
  site_key: string;
  supabase_url: string;
  supabase_anon_key: string;
  name: string;
  domain: string;
};

const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: "Supabase project" },
  { id: 2, label: "Database table" },
  { id: 3, label: "Tracking script" },
];

function StepColumns({
  guide,
  children,
}: {
  guide: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:gap-0">
      <aside className="space-y-3 border-b border-zinc-100 bg-white/60 pb-5 text-sm lg:border-b-0 lg:border-r lg:bg-transparent lg:pb-0 lg:pr-6 dark:border-zinc-800 dark:bg-zinc-950/40 lg:dark:bg-transparent">
        {guide}
      </aside>
      <div className="space-y-4 lg:pl-6">{children}</div>
    </div>
  );
}

export function AddWebsiteModal({ open, onClose }: AddWebsiteModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [projectId, setProjectId] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [created, setCreated] = useState<CreatedProject | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) return;
    setStep(1);
    setName("");
    setDomain("");
    setProjectId("");
    setPublicKey("");
    setError(null);
    setLoading(false);
    setSqlCopied(false);
    setSnippetCopied(false);
    setCreated(null);
  }, [open]);

  if (!open) return null;

  const snippet =
    created &&
    buildTrackerSnippet({
      siteKey: created.site_key,
      supabaseUrl: created.supabase_url,
      supabaseAnonKey: created.supabase_anon_key,
    });

  function goToStep2() {
    setError(null);
    if (!name.trim() || !domain.trim() || !projectId.trim() || !publicKey.trim()) {
      setError("Fill in website name, domain, project ID, and publishable key.");
      return;
    }
    setStep(2);
  }

  async function copySql() {
    try {
      await navigator.clipboard.writeText(ANALYTICS_SCHEMA_FULL_SQL);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2000);
    } catch {
      setSqlCopied(false);
    }
  }

  async function copySnippet() {
    if (!snippet) return;
    try {
      await navigator.clipboard.writeText(snippet);
      setSnippetCopied(true);
      setTimeout(() => setSnippetCopied(false), 2000);
    } catch {
      setSnippetCopied(false);
    }
  }

  async function handleStep2Next() {
    setError(null);
    setLoading(true);

    try {
      const verifyRes = await fetch("/api/sites/verify", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabaseProjectId: projectId,
          supabaseAnonKey: publicKey,
        }),
      });
      const verifyData = await verifyRes.json();
      if (verifyRes.status === 401) {
        setError("Please sign in to add a website.");
        return;
      }
      if (!verifyRes.ok) {
        setError(
          verifyData.error ??
            "Could not read the events table. Run the SQL below in Supabase, then try again."
        );
        return;
      }

      const createRes = await fetch("/api/sites", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          domain,
          supabaseProjectId: projectId,
          supabaseAnonKey: publicKey,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        setError(createData.error ?? "Could not save website.");
        return;
      }

      setCreated({
        id: createData.id,
        site_key: createData.site_key,
        supabase_url: createData.supabase_url,
        supabase_anon_key: createData.supabase_anon_key,
        name: createData.name ?? name,
        domain: createData.domain ?? domain,
      });
      setStep(3);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleDone() {
    const id = created?.id;
    onClose();
    if (id) {
      router.push(`/app/${id}`);
      router.refresh();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-website-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
          <h2
            id="add-website-title"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
          >
            Add website
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <nav
          className="flex border-b border-zinc-100 px-5 py-3 dark:border-zinc-800"
          aria-label="Setup steps"
        >
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`flex flex-1 items-center gap-2 text-xs ${
                step >= s.id
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-zinc-400"
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                  step >= s.id
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {s.id}
              </span>
              <span className="hidden font-medium sm:inline">{s.label}</span>
              {i < STEPS.length - 1 && (
                <span className="mx-1 hidden h-px flex-1 bg-zinc-200 sm:block dark:bg-zinc-700" />
              )}
            </div>
          ))}
        </nav>

        <div className="max-h-[calc(90vh-9rem)] overflow-y-auto bg-zinc-50/50 p-5 dark:bg-zinc-900/20 lg:p-6">
          {step === 1 && (
            <StepColumns
              guide={
                <>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Step 1 — Create a Supabase project
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300">
                    Open Analytics stores your traffic in <strong>your</strong> Supabase
                    account. Create a new project (free tier is fine).
                  </p>
                  <ol className="list-decimal space-y-2 pl-4 text-zinc-600 dark:text-zinc-300">
                    <li>
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-emerald-600 hover:underline"
                      >
                        Open Supabase Dashboard
                      </a>{" "}
                      → <strong>New project</strong>.
                    </li>
                    <li>
                      Wait until the project is ready, then go to{" "}
                      <strong>Project Settings</strong> → <strong>API</strong>.
                    </li>
                    <li>
                      Copy <strong>Project ID</strong> and the <strong>Publishable</strong>{" "}
                      (anon) key into the form on the right.
                    </li>
                  </ol>
                  <p className="text-xs text-zinc-500">
                    Signing in to this dashboard uses a separate Supabase project (the app
                    host). The fields on the right connect only your analytics database.
                  </p>
                </>
              }
            >
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
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Supabase project ID
                </label>
                <input
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="Reference ID or https://xxx.supabase.co"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Supabase publishable key
                </label>
                <input
                  type="password"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  placeholder="Publishable (anon) key"
                  autoComplete="off"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-mono dark:border-zinc-700 dark:bg-zinc-900"
                />
              </div>
            </StepColumns>
          )}

          {step === 2 && (
            <StepColumns
              guide={
                <>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Step 2 — Create the events table
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300">
                    In the same Supabase project from step 1:
                  </p>
                  <ol className="list-decimal space-y-2 pl-4 text-zinc-600 dark:text-zinc-300">
                    <li>
                      Open <strong>SQL Editor</strong> → <strong>New query</strong>.
                    </li>
                    <li>
                      Copy the SQL on the right, paste into the editor, and click{" "}
                      <strong>Run</strong> once.
                    </li>
                    <li>
                      Click <strong>Next</strong> — we verify the <strong>events</strong>{" "}
                      table exists and is readable.
                    </li>
                  </ol>
                  <p className="text-xs text-zinc-500">
                    Optional — live visitor map: <strong>Database</strong> →{" "}
                    <strong>Publications</strong> → <strong>supabase_realtime</strong> → enable{" "}
                    <strong>events</strong>.
                  </p>
                </>
              }
            >
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    SQL to run
                  </label>
                  <button
                    type="button"
                    onClick={copySql}
                    className="shrink-0 rounded px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                  >
                    {sqlCopied ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="max-h-72 overflow-auto rounded-lg border border-zinc-200 bg-zinc-900 p-3 text-[10px] leading-relaxed text-zinc-100 dark:border-zinc-700">
                  {ANALYTICS_SCHEMA_FULL_SQL}
                </pre>
                <p className="mt-2 text-xs text-zinc-500">
                  After running the SQL in Supabase, click Next below.
                </p>
              </div>
            </StepColumns>
          )}

          {step === 3 && created && snippet && (
            <StepColumns
              guide={
                <>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Step 3 — Add the tracker to your site
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300">
                    <strong>{created.name}</strong> ({created.domain}) is connected to Open
                    Analytics.
                  </p>
                  <ol className="list-decimal space-y-2 pl-4 text-zinc-600 dark:text-zinc-300">
                    <li>Copy the embed code on the right.</li>
                    <li>
                      Paste it before{" "}
                      <code className="rounded bg-zinc-200 px-1 text-xs dark:bg-zinc-800">
                        &lt;/head&gt;
                      </code>{" "}
                      on every page you want to track.
                    </li>
                    <li>Deploy or refresh your site — visits should appear in the dashboard.</li>
                  </ol>
                  <p className="text-xs text-zinc-500">
                    Site key:{" "}
                    <code className="text-zinc-700 dark:text-zinc-300">{created.site_key}</code>.
                    You can copy the snippet again anytime from the Tracking page.
                  </p>
                </>
              }
            >
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Embed code
                  </label>
                  <button
                    type="button"
                    onClick={copySnippet}
                    className="shrink-0 rounded-md border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
                  >
                    {snippetCopied ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="max-h-72 overflow-auto rounded-lg border border-zinc-200 bg-white p-3 text-[10px] leading-relaxed dark:border-zinc-700 dark:bg-zinc-900">
                  {snippet}
                </pre>
              </div>
            </StepColumns>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300 lg:col-span-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2 border-t border-zinc-100 px-5 py-4 dark:border-zinc-800">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={goToStep2}
                className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500"
              >
                Next
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep(1);
                }}
                disabled={loading}
                className="flex-1 rounded-lg border border-zinc-300 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:hover:bg-zinc-800"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStep2Next}
                disabled={loading}
                className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading ? "Checking…" : "Next"}
              </button>
            </>
          )}
          {step === 3 && (
            <button
              type="button"
              onClick={handleDone}
              className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Open dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
