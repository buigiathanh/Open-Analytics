import { DocsLead, DocsProse } from "@/components/docs/DocsProse";

export default function DocsSecurityPage() {
  return (
    <DocsProse>
      <h1>Security</h1>
      <DocsLead>
        The default schema is optimized for self-hosted demos and quick setup. Before
        exposing a public instance, review these risks and mitigations.
      </DocsLead>

      <h2>Supabase anon key in the browser</h2>
      <p>
        The standard embed snippet includes the site project&apos;s <strong>anon key</strong>.
        Anyone can read it from your page source. With default RLS, that key can:
      </p>
      <ul>
        <li>Insert events for valid <code>site_key</code> values</li>
        <li>Read all events (dashboard policy allows <code>select</code> for anon)</li>
      </ul>
      <p>
        <strong>Mitigations:</strong>
      </p>
      <ul>
        <li>
          Use <code>data-endpoint</code> and a server route that validates payloads instead of
          exposing the publishable key in HTML.
        </li>
        <li>
          Tighten RLS: remove broad <code>select</code> for anon; authenticate dashboard
          users and use user-scoped policies.
        </li>
        <li>Restrict inserts by IP or rate limit at the edge.</li>
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
        <li>Direct API inserts into <code>events</code></li>
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
