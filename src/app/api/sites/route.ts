import { NextResponse } from "next/server";
import { createAppAdminClient } from "@/lib/supabase/admin";
import {
  isAppServiceRoleConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import {
  supabaseUrlFromProjectId,
  verifyUserAnalyticsProject,
} from "@/lib/supabase-project";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Dashboard is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.",
      },
      { status: 503 }
    );
  }

  if (!isAppServiceRoleConfigured()) {
    return NextResponse.json(
      {
        error:
          "Missing SUPABASE_SERVICE_ROLE_KEY in .env (app project Secret key). Required to save projects on the server after sign-in.",
      },
      { status: 503 }
    );
  }

  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appAdmin = createAppAdminClient();
  if (!appAdmin) {
    return NextResponse.json(
      { error: "App admin client could not be created." },
      { status: 503 }
    );
  }

  let body: {
    name?: string;
    domain?: string;
    supabaseProjectId?: string;
    supabaseAnonKey?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const domain = body.domain?.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  const projectId = body.supabaseProjectId?.trim();
  const publicKey = body.supabaseAnonKey?.trim();

  if (!name || !domain || !projectId || !publicKey) {
    return NextResponse.json(
      {
        error:
          "Please fill in name, domain, your Supabase Project ID, and Publishable key.",
      },
      { status: 400 }
    );
  }

  const supabaseUrl = supabaseUrlFromProjectId(projectId);
  if (!supabaseUrl) {
    return NextResponse.json(
      { error: "Invalid Supabase Project ID / URL." },
      { status: 400 }
    );
  }

  const verified = await verifyUserAnalyticsProject(supabaseUrl, publicKey);
  if (!verified.ok) {
    return NextResponse.json({ error: verified.message }, { status: 400 });
  }

  const projectRef = supabaseUrl.replace(/^https:\/\//, "").replace(/\.supabase\.co$/i, "");

  const { data: dashboardSite, error: dashboardError } = await appAdmin
    .from("projects")
    .insert({
      name,
      domain,
      supabase_project_id: projectRef,
      supabase_url: supabaseUrl,
      supabase_anon_key: publicKey,
      user_id: user.id,
    })
    .select("id, site_key")
    .single();

  if (dashboardError || !dashboardSite) {
    const msg = dashboardError?.message ?? "unknown";
    const needsMigration =
      msg.includes("user_id") ||
      msg.includes("column") ||
      msg.includes("policy") ||
      msg.includes("projects");
    return NextResponse.json(
      {
        error: needsMigration
          ? "App database is missing the projects table. Run supabase/schema-app.sql on your app Supabase project (.env), then try again."
          : `Your Supabase project is OK but saving to the app database failed: ${msg}`,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: dashboardSite.id,
    site_key: dashboardSite.site_key,
    supabase_url: supabaseUrl,
    supabase_anon_key: publicKey,
    name,
    domain,
  });
}
