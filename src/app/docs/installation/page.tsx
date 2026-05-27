import { DocsLead, DocsProse } from "@/components/docs/DocsProse";

export default function DocsInstallationPage() {
  return (
    <DocsProse>
      <h1>Installation</h1>
      <DocsLead>
        Run the Open Analytics dashboard on your machine or deploy it to any Node.js
        host that supports Next.js (Vercel, Docker, etc.).
      </DocsLead>

      <h2>Requirements</h2>
      <ul>
        <li>Node.js 18+ (LTS recommended)</li>
        <li>
          One Supabase project for the <strong>app</strong> (sign-in + site list — see{" "}
          <a href="/docs/supabase">Supabase setup</a>)
        </li>
        <li>
          One Supabase project <strong>per website</strong> you measure (your analytics data)
        </li>
        <li>npm, pnpm, or yarn</li>
      </ul>

      <h2>Clone and configure</h2>
      <pre>{`git clone <your-repo-url> open-analytics
cd open-analytics
cp .env.example .env.local`}</pre>

      <p>
        <code>.env.local</code> is only for the <strong>dashboard app</strong>, not for your
        analytics projects:
      </p>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>NEXT_PUBLIC_SUPABASE_URL</code>
            </td>
            <td>App Supabase project URL</td>
          </tr>
          <tr>
            <td>
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
            </td>
            <td>App publishable key (sign-in)</td>
          </tr>
          <tr>
            <td>
              <code>SUPABASE_SERVICE_ROLE_KEY</code>
            </td>
            <td>App Secret key — server saves sites to app DB after sign-in</td>
          </tr>
          <tr>
            <td>
              <code>NEXT_PUBLIC_APP_URL</code>
            </td>
            <td>
              Public URL of this app (used in embed snippets and geo proxy), e.g.{" "}
              <code>https://analytics.example.com</code>
            </td>
          </tr>
        </tbody>
      </table>

      <p>
        Run <code>supabase/schema-app.sql</code> on the app Supabase project in <code>.env</code>.
        When you add a website, run <code>supabase/schema-analytics.sql</code> on your tracking
        project, deploy <code>public/worker.js</code> to Cloudflare, and enter Project ID +
        publishable key in the dashboard.
      </p>

      <h2>Run locally</h2>
      <pre>{`npm install
npm run dev`}</pre>
      <p>
        Open the URL shown in the terminal (often port 3000). Sign in, then add a website with your
        analytics Supabase credentials.
      </p>

      <h2>Production build</h2>
      <pre>{`npm run build
npm run start`}</pre>
      <p>
        Set <code>NEXT_PUBLIC_APP_URL</code> to your HTTPS origin before building. Add{" "}
        <code>https://your-domain.com/auth/callback</code> to Supabase Auth redirect URLs.
      </p>
    </DocsProse>
  );
}
