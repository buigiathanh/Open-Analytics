import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isPostgresConfigured } from "@/lib/db/config";
import { updateProjectShare } from "@/lib/db/projects";
import { getSiteForUser } from "@/lib/registry-sites";

interface RouteContext {
  params: Promise<{ siteId: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Dashboard is not configured." }, { status: 503 });
  }
  if (!isPostgresConfigured()) {
    return NextResponse.json({ error: "Missing POSTGRES_URL." }, { status: 503 });
  }

  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { siteId } = await context.params;
  const site = await getSiteForUser(siteId, user.id);
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

  const data = await updateProjectShare(siteId, user.id, body.enabled);
  if (!data) {
    return NextResponse.json(
      { error: "Could not update share setting." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: data.id,
    share_realtime_enabled: data.share_realtime_enabled,
  });
}
