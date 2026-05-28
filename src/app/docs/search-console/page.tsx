import Link from "next/link";
import { DocsLead, DocsProse } from "@/components/docs/DocsProse";

export default function DocsSearchConsolePage() {
  return (
    <DocsProse>
      <h1>Google Search Console</h1>
      <DocsLead>
        Connect Search Console per website to view Google Search performance (clicks,
        impressions, queries, pages, geography) inside the dashboard — separate from
        Supabase sign-in OAuth.
      </DocsLead>

      <h2>What it does</h2>
      <ul>
        <li>
          <strong>Search Console page</strong> —{" "}
          <code>/app/[siteId]/search-console</code>: performance chart, breakdown tabs
          (queries, pages, countries, devices), sitemaps
        </li>
        <li>
          <strong>Stats overview</strong> — optional <em>Search clicks</em> line on the
          trend chart when connected (toggle with Pageviews / Visitors)
        </li>
        <li>
          OAuth tokens stored in the <strong>app Supabase</strong> database (server-only,
          per project)
        </li>
      </ul>

      <h2>Not the same as dashboard sign-in</h2>
      <p>
        Logging in with Google via Supabase (<Link href="/docs/auth">Sign-in setup</Link>)
        only authenticates you to Open Analytics. Search Console uses a{" "}
        <strong>different Google OAuth client</strong>, different redirect URL, and
        scopes for the Search Console API (<code>webmasters</code>).
      </p>
      <p>
        You must connect Search Console again from the site&apos;s Search Console page
        even if you already sign in with Google.
      </p>

      <h2>Prerequisites</h2>
      <ol>
        <li>
          App Supabase configured (<Link href="/docs/supabase">Supabase setup</Link>) with{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code> (tokens are written with the service role)
        </li>
        <li>
          Run the Search Console migration on your <strong>app</strong> database (see below)
        </li>
        <li>
          A Google Cloud project with <strong>Search Console API</strong> enabled and a{" "}
          <strong>Web application</strong> OAuth client
        </li>
        <li>
          The Google account you use must have access to the property in{" "}
          <a href="https://search.google.com/search-console">Google Search Console</a> for
          your site&apos;s domain
        </li>
      </ol>

      <h2>1. Database migration (app Supabase)</h2>
      <p>
        In the Supabase SQL editor for your <strong>registry / app</strong> project, run:
      </p>
      <pre>{`-- File: supabase/migrations/add-google-search-console.sql
create table public.google_search_console_connections (
  ...
);

-- File: supabase/migrations/add-gsc-managed-links.sql
create table public.gsc_managed_links (
  ...
);`}</pre>
      <p>
        Or use the full definition in <code>supabase/schema-app.sql</code> if you are
        bootstrapping a new app database. The table stores refresh tokens; RLS is enabled
        with <strong>no</strong> client policies — only API routes using the service role
        read or write tokens.
      </p>

      <h2>2. Google Cloud Console</h2>

      <h3>Enable the API</h3>
      <ol>
        <li>
          Open{" "}
          <a href="https://console.cloud.google.com/apis/library">
            Google Cloud Console → APIs &amp; Services → Library
          </a>
        </li>
        <li>
          Search for <strong>Google Search Console API</strong> and click <strong>Enable</strong>
        </li>
      </ol>

      <h3>OAuth consent screen</h3>
      <ol>
        <li>
          <strong>APIs &amp; Services → OAuth consent screen</strong> — configure app name,
          support email, developer contact
        </li>
        <li>
          If the app is in <strong>Testing</strong>, add every Google account that will
          connect under <strong>Test users</strong>
        </li>
        <li>
          Scopes used by Open Analytics: Search Console (<code>webmasters</code>) and email
          (to show which account is connected)
        </li>
      </ol>

      <h3>Create OAuth client (Web)</h3>
      <ol>
        <li>
          <strong>APIs &amp; Services → Credentials → Create credentials → OAuth client
          ID</strong>
        </li>
        <li>Application type: <strong>Web application</strong></li>
        <li>
          <strong>Authorized redirect URIs</strong> — add the exact callback URL(s) for your
          deployment:
          <pre>{`http://localhost:3000/api/integrations/google/search-console/callback
http://localhost:3001/api/integrations/google/search-console/callback
https://your-production-domain.com/api/integrations/google/search-console/callback`}</pre>
          Use the host and port that match <code>NEXT_PUBLIC_APP_URL</code>. The path must
          be exactly{" "}
          <code>/api/integrations/google/search-console/callback</code> (no trailing slash).
        </li>
        <li>Copy the <strong>Client ID</strong> and <strong>Client secret</strong></li>
      </ol>

      <blockquote>
        <strong>redirect_uri_mismatch</strong> means the redirect URI in Google Cloud does
        not exactly match what the app sends. The app uses{" "}
        <code>NEXT_PUBLIC_APP_URL</code>, not the browser port alone, when building the
        redirect URI.
      </blockquote>

      <h2>3. Environment variables</h2>
      <p>
        Add to <code>.env.local</code> (see <code>.env.example</code>):
      </p>
      <pre>{`NEXT_PUBLIC_APP_URL=http://localhost:3000

GOOGLE_SEARCH_CONSOLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET=GOCSPX-...

# Optional: separate HMAC secret for OAuth state (defaults to SUPABASE_SERVICE_ROLE_KEY)
# GOOGLE_OAUTH_STATE_SECRET=`}</pre>
      <p>Restart the Next.js dev server after changing env vars.</p>

      <h2>4. Connect in the dashboard</h2>
      <ol>
        <li>
          Sign in to Open Analytics and open a website from <code>/app</code>
        </li>
        <li>
          In the left sidebar under <strong>Analytics</strong>, open{" "}
          <strong>Search Console</strong>
        </li>
        <li>
          If OAuth is configured, click <strong>Connect with Google</strong> and approve
          access
        </li>
        <li>
          After redirect, if your domain matches a property automatically, data loads
          immediately. Otherwise choose the correct <strong>Search Console property</strong>{" "}
          (URL-prefix or <code>sc-domain:example.com</code>) and click <strong>Continue</strong>
        </li>
      </ol>
      <p>
        The site&apos;s <strong>domain</strong> field (from site settings) is used to pick a
        default property when possible.
      </p>

      <h2>Using Search Console data</h2>

      <h3>Search Console page</h3>
      <ul>
        <li>
          <strong>Date range</strong> — 7 days, 28 days, or 3 months (top of Performance tab)
        </li>
        <li>
          <strong>Performance</strong> — impressions, clicks, CTR, position, trend chart, search
          breakdown table with sortable columns and pagination
        </li>
        <li>
          <strong>Breakdown tabs</strong> — Queries, Pages, Countries, Devices
        </li>
        <li>
          <strong>Sitemaps</strong> — list, submit, and remove sitemaps (requires write
          scope)
        </li>
        <li>
          <strong>Links</strong> — pages from search analytics; check index status per
          URL with the search icon (URL Inspection API)
        </li>
        <li>
          <strong>Disconnect</strong> — removes stored tokens for that website
        </li>
      </ul>

      <h3>Stats overview overlay</h3>
      <p>
        On <code>/app/[siteId]</code>, when Search Console is connected, the trend chart can
        show a blue dashed <strong>Search clicks</strong> series (right axis). Use the{" "}
        <strong>Show:</strong> checkboxes above the chart to toggle Pageviews, Visitors, and
        Search clicks. Choices are remembered per site in the browser session.
      </p>

      <h2>Troubleshooting</h2>
      <table>
        <thead>
          <tr>
            <th>Issue</th>
            <th>What to check</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>Search Console not configured</code> on the page
            </td>
            <td>
              <code>GOOGLE_SEARCH_CONSOLE_CLIENT_ID</code> and{" "}
              <code>GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET</code> set; server restarted
            </td>
          </tr>
          <tr>
            <td>
              <code>redirect_uri_mismatch</code>
            </td>
            <td>
              Redirect URI in Google Cloud matches{" "}
              <code>{`{NEXT_PUBLIC_APP_URL}/api/integrations/google/search-console/callback`}</code>
            </td>
          </tr>
          <tr>
            <td>Access blocked / app in Testing</td>
            <td>Add your Google account under OAuth consent screen → Test users</td>
          </tr>
          <tr>
            <td>API errors / 403 after connect</td>
            <td>Enable <strong>Google Search Console API</strong> in the same Cloud project as the OAuth client</td>
          </tr>
          <tr>
            <td>No data / empty charts</td>
            <td>
              Property has Search traffic in GSC; correct property selected; new sites may
              have little or no data yet
            </td>
          </tr>
          <tr>
            <td>Could not save / disconnect fails</td>
            <td>
              Run <code>add-google-search-console.sql</code> and{" "}
              <code>add-gsc-managed-links.sql</code>; confirm{" "}
              <code>SUPABASE_SERVICE_ROLE_KEY</code>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Security notes</h2>
      <ul>
        <li>
          Refresh tokens live in <code>google_search_console_connections</code> — never
          exposed to the browser
        </li>
        <li>
          Only the signed-in owner of the website (matching <code>projects.user_id</code>)
          can connect or load data via API routes
        </li>
        <li>
          See also <Link href="/docs/security">Security</Link> for general production
          hardening
        </li>
      </ul>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/dashboard">Dashboard</Link> — sidebar navigation and Stats view
        </li>
        <li>
          <Link href="/docs/auth">Sign-in setup</Link> — Supabase Google/GitHub login (separate)
        </li>
        <li>
          <Link href="/docs/installation">Installation</Link> — local <code>.env.local</code>
        </li>
      </ul>
    </DocsProse>
  );
}
