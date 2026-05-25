import { DocsLead, DocsProse } from "@/components/docs/DocsProse";

export default function DocsSupabasePage() {
  return (
    <DocsProse>
      <h1>Supabase setup</h1>
      <DocsLead>
        Two SQL files: <code>schema-app.sql</code> for the management app (`.env`), and{" "}
        <code>schema-analytics.sql</code> for each website&apos;s tracking project (your data).
        You may use two Supabase projects or one — your choice.
      </DocsLead>

      <h2>1. App Supabase (management — `.env`)</h2>
      <p>Whoever hosts this Next.js app creates one project for sign-in and the site list on /app.</p>
      <ol>
        <li>Create a project at supabase.com.</li>
        <li>
          <strong>SQL Editor</strong> → run <code>supabase/schema-app.sql</code>.
        </li>
        <li>
          <strong>Settings → API</strong> → copy URL, Publishable key, and Secret key into{" "}
          <code>.env.local</code> (see <code>.env.example</code>).
        </li>
        <li>Enable Auth providers (Google, GitHub) if needed.</li>
      </ol>
      <p>
        This database stores <strong>no pageviews</strong> — only accounts and the{" "}
        <code>projects</code> table (which analytics Supabase URL + key to use per website).
      </p>

      <h2>2. Your analytics Supabase (per website)</h2>
      <p>
        For each tracked site, create <strong>your own</strong> Supabase project (or reuse one
        project for multiple sites).
      </p>
      <ol>
        <li>Create the project.</li>
        <li>
          <strong>SQL Editor</strong> → run <code>supabase/schema-analytics.sql</code> (copy blocks
          are also in the Add website dialog).
        </li>
        <li>
          <strong>Realtime</strong>: Publications → <code>supabase_realtime</code> → add{" "}
          <code>events</code>.
        </li>
        <li>
          Copy Project URL + Publishable key into <strong>Add website</strong> and into{" "}
          <code>tracker.js</code>.
        </li>
      </ol>

      <h2>One project for everything (optional)</h2>
      <p>
        Run <strong>both</strong> SQL files on the same Supabase project. The app uses table{" "}
        <code>projects</code> (with <code>site_key</code>); tracking uses only <code>events</code>.
      </p>

      <h2>Row Level Security</h2>
      <ul>
        <li>
          <strong>App project</strong>: authenticated users manage only their rows in{" "}
          <code>projects</code>.
        </li>
        <li>
          <strong>Analytics project</strong>: anon insert/select on <code>events</code> (tracker +
          dashboard reads). <code>site_key</code> must match a row in app <code>projects</code>.
        </li>
      </ul>

      <h2>Tables</h2>
      <table>
        <thead>
          <tr>
            <th>Table</th>
            <th>File</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>profiles</code>, <code>projects</code>
            </td>
            <td>schema-app.sql</td>
            <td>Management app (registered websites)</td>
          </tr>
          <tr>
            <td>
              <code>events</code>
            </td>
            <td>schema-analytics.sql</td>
            <td>Tracking data (<code>site_key</code> from app)</td>
          </tr>
        </tbody>
      </table>
    </DocsProse>
  );
}
