import { DocsLead, DocsProse } from "@/components/docs/DocsProse";

export default function DocsSecurityPage() {
  return (
    <DocsProse>
      <h1>Security</h1>
      <DocsLead>
        The default schema is optimized for self-hosted demos and quick setup. Before
        exposing a public instance, review these risks and mitigations.
      </DocsLead>

      <h2>Publishable key in the browser</h2>
      <p>
        The dashboard still needs your analytics project&apos;s <strong>publishable key</strong>{" "}
        to read <code>events</code>. Default RLS allows <code>select</code> only — not{" "}
        <code>insert</code>. Anyone who obtains the key can read all events for that project;
        they cannot insert without the Secret key on your worker.
      </p>
      <p>
        <strong>Mitigations:</strong>
      </p>
      <ul>
        <li>
          Send events via <code>data-endpoint</code> and a{" "}
          <a href="/docs/worker">Cloudflare Worker</a> that holds the Secret key.
        </li>
        <li>
          Tighten RLS further: remove broad <code>select</code> for anon; authenticate
          dashboard users and use user-scoped policies.
        </li>
        <li>Rate limit at the edge (included in <code>public/worker.js</code>).</li>
      </ul>

      <h2>App vs analytics projects</h2>
      <p>
        The app Supabase project (`.env`) should only hold accounts and site bookmarks. Your
        analytics Supabase project holds events — tighten anon policies there before high traffic.
      </p>

      <h2>Bot traffic</h2>
      <p>
        The tracker skips common bots via User-Agent regex. This does not stop:
      </p>
      <ul>
        <li>Bots that mimic a normal browser</li>
        <li>Direct API inserts into <code>events</code> (blocked for publishable key; use worker Secret key)</li>
        <li>Historical bot data already stored</li>
      </ul>
      <p>
        Server-side filtering would require storing <code>user_agent</code> or an{" "}
        <code>is_bot</code> flag and excluding those rows in aggregations.
      </p>

      <h2>Privacy</h2>
      <ul>
        <li>
          Visitor identification uses a fingerprint + <code>localStorage</code> — disclose
          this in your privacy policy where required (e.g. GDPR).
        </li>
        <li>
          Optional <code>data-do-not-track="true"</code> respects browser DNT when enabled.
        </li>
        <li>
          <code>identify()</code> can attach a logged-in user id; treat <code>distinct_id</code>{" "}
          as personal data if it maps to accounts.
        </li>
        <li>Geo uses approximate location from IP via your geo endpoint — document retention.</li>
      </ul>

      <h2>Production checklist</h2>
      <ol>
        <li>Replace open RLS with auth-backed policies.</li>
        <li>Keep app and analytics Supabase keys scoped; rotate if leaked.</li>
        <li>Set <code>NEXT_PUBLIC_APP_URL</code> to HTTPS production origin.</li>
        <li>Enable Supabase rate limiting / WAF as needed.</li>
        <li>Rotate anon/service keys if leaked.</li>
        <li>Back up per-site Supabase projects regularly.</li>
      </ol>
    </DocsProse>
  );
}
