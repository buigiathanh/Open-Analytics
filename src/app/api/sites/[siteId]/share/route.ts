import { NextResponse } from "next/server";
import { createAppAdminClient } from "@/lib/supabase/admin";
import {
  isAppServiceRoleConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { getSiteForUser } from "@/lib/registry-sites";

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

  let body: { enabled?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.enabled !== "boolean") {
    return NextResponse.json(
      { error: "Body must include enabled: true or false." },
      { status: 400 }
    );
  }

  const admin = createAppAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Admin client unavailable." }, { status: 503 });
  }

  const { data, error } = await admin
    .from("projects")
    .update({ share_realtime_enabled: body.enabled })
    .eq("id", siteId)
    .eq("user_id", user.id)
    .select("id, share_realtime_enabled")
    .single();

  if (error || !data) {
    return NextResponse.json(
      {
        error:
          "Could not update share setting. Run supabase/migrations/add-share-realtime-enabled.sql on your app database.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: data.id,
    share_realtime_enabled: data.share_realtime_enabled,
  });
}
