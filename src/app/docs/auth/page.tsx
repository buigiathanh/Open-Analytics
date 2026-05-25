import Link from "next/link";
import { DocsLead, DocsProse } from "@/components/docs/DocsProse";

const SUPABASE_CALLBACK =
  "https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback";

export default function DocsAuthPage() {
  return (
    <DocsProse>
      <h1>Sign-in (Google & GitHub)</h1>
      <DocsLead>
        Dashboard login uses Supabase Auth. OAuth runs on Supabase first, then
        redirects back to this app at <code>/auth/callback</code>.
      </DocsLead>

      <h2>1. URL configuration (Supabase)</h2>
      <p>
        Supabase Dashboard → <strong>Authentication</strong> →{" "}
        <strong>URL Configuration</strong>:
      </p>
      <ul>
        <li>
          <strong>Site URL</strong> — same as <code>NEXT_PUBLIC_APP_URL</code>{" "}
          (e.g. <code>http://localhost:3001</code>)
        </li>
        <li>
          <strong>Redirect URLs</strong> — add:
          <pre>{`http://localhost:3001/auth/callback
https://your-production-domain.com/auth/callback`}</pre>
        </li>
      </ul>
      <p>
        Open the app at the <strong>same host and port</strong> as{" "}
        <code>NEXT_PUBLIC_APP_URL</code>. Do not mix <code>localhost</code> and{" "}
        <code>127.0.0.1</code>.
      </p>

      <h2>2. GitHub OAuth App (not GitHub App)</h2>
      <p>
        GitHub → Settings → Developer settings →{" "}
        <strong>OAuth Apps</strong> → New OAuth App:
      </p>
      <ul>
        <li>
          <strong>Authorization callback URL</strong> (exactly):
          <pre>{SUPABASE_CALLBACK}</pre>
          Replace <code>YOUR_PROJECT_REF</code> with your project ref from the
          Supabase URL.
        </li>
      </ul>
      <p>
        Supabase → <strong>Authentication</strong> → <strong>Providers</strong>{" "}
        → <strong>GitHub</strong>: enable, paste Client ID and Client Secret,
        Save.
      </p>
      <p>
        If you see <em>Error getting user profile from external provider</em>:
      </p>
      <ol>
        <li>
          Confirm you created an <strong>OAuth App</strong>, not a &quot;GitHub
          App&quot; (different product).
        </li>
        <li>
          Regenerate the Client Secret on GitHub and paste the new secret into
          Supabase.
        </li>
        <li>
          GitHub → Settings → Emails: verify your primary email; avoid blocking
          all email visibility if Supabase cannot read an address.
        </li>
        <li>
          Sign out of GitHub, sign in again, and approve the{" "}
          <strong>user:email</strong> permission when prompted.
        </li>
        <li>
          Check Supabase → Authentication → <strong>Logs</strong> for the exact
          failure.
        </li>
      </ol>

      <h2>3. Google OAuth</h2>
      <p>Google Cloud Console → APIs & Services → Credentials → OAuth client (Web):</p>
      <ul>
        <li>
          <strong>Authorized redirect URIs</strong>:
          <pre>{SUPABASE_CALLBACK}</pre>
        </li>
      </ul>
      <p>
        Supabase → Providers → <strong>Google</strong>: enable, paste Client ID
        and Secret.
      </p>
      <p>
        If the OAuth consent screen is in <strong>Testing</strong>, add your
        Google account under <strong>Test users</strong>.
      </p>

      <h2>4. Environment variables</h2>
      <pre>{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...   # legacy anon JWT, or publishable key
NEXT_PUBLIC_APP_URL=http://localhost:3001`}</pre>
      <p>
        If sign-in still fails, try the <strong>anon</strong> (JWT, starts with{" "}
        <code>eyJ</code>) key from Supabase → Project Settings → API instead of
        the publishable key, then restart <code>npm run dev</code>.
      </p>

      <h2>5. Database (profiles)</h2>
      <p>
        Run <code>supabase/schema-app.sql</code> on the app Supabase project in <code>.env</code>.
      </p>

      <p>
        Back to <Link href="/docs/installation">Installation</Link> or{" "}
        <Link href="/">home</Link> to try sign-in again.
      </p>
    </DocsProse>
  );
}
