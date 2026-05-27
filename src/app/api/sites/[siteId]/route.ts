import { NextResponse } from "next/server";
import { createAppAdminClient } from "@/lib/supabase/admin";
import {
  isAppServiceRoleConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getSiteForUser } from "@/lib/registry-sites";
import {
  supabaseUrlFromProjectId,
  verifyUserAnalyticsProject,
} from "@/lib/supabase-project";

interface RouteContext {
  params: Promise<{ siteId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Dashboard is not configured." }, { status: 503 });
  }
  if (!isAppServiceRoleConfigured()) {
    return NextResponse.json(
      { error: "Missing SUPABASE_SERVICE_ROLE_KEY." },
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

  const { siteId } = await context.params;
  const registry = await createClient();
  const site = await getSiteForUser(registry, siteId, user.id);
  if (!site) {
    return NextResponse.json({ error: "Site not found." }, { status: 404 });
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

  if (!name || !domain || !projectId) {
    return NextResponse.json(
      { error: "Please fill in name, domain, and Supabase project ID." },
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

  const projectRef = supabaseUrl.replace(/^https:\/\//, "").replace(/\.supabase\.co$/i, "");
  const keyToUse = publicKey || site.supabase_anon_key;

  if (!keyToUse) {
    return NextResponse.json(
      { error: "Supabase publishable key is required." },
      { status: 400 }
    );
  }

  const credsChanged =
    projectRef !== site.supabase_project_id ||
    supabaseUrl !== site.supabase_url ||
    (publicKey !== undefined && publicKey !== site.supabase_anon_key);

  if (credsChanged) {
    const verified = await verifyUserAnalyticsProject(supabaseUrl, keyToUse);
    if (!verified.ok) {
      return NextResponse.json({ error: verified.message }, { status: 400 });
    }
  }

  const admin = createAppAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client unavailable." }, { status: 503 });
  }

  const updatePayload: {
    name: string;
    domain: string;
    supabase_project_id: string;
    supabase_url: string;
    supabase_anon_key?: string;
  } = {
    name,
    domain,
    supabase_project_id: projectRef,
    supabase_url: supabaseUrl,
  };

  if (publicKey) {
    updatePayload.supabase_anon_key = publicKey;
  }

  const { data, error } = await admin
    .from("projects")
    .update(updatePayload)
    .eq("id", siteId)
    .eq("user_id", user.id)
    .select("id, name, domain, supabase_project_id, supabase_url, site_key, created_at, user_id, share_realtime_enabled")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not update project settings." },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
