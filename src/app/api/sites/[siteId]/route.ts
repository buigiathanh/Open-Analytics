import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isPostgresConfigured } from "@/lib/db/config";
import { updateProject } from "@/lib/db/projects";
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

  let body: { name?: string; domain?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const domain = body.domain
    ?.trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  if (!name || !domain) {
    return NextResponse.json(
      { error: "Please fill in name and domain." },
      { status: 400 }
    );
  }

  const updated = await updateProject(siteId, user.id, { name, domain });
  if (!updated) {
    return NextResponse.json(
      { error: "Could not update project settings." },
      { status: 500 }
    );
  }

  return NextResponse.json(updated);
}
