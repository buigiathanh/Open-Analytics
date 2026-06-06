import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isPostgresConfigured } from "@/lib/db/config";
import { createProject } from "@/lib/db/projects";

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

  if (!isPostgresConfigured()) {
    return NextResponse.json(
      {
        error:
          "Missing POSTGRES_URL in .env. Run supabase/schema-postgres.sql on your PostgreSQL database.",
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
      { error: "Please fill in website name and domain." },
      { status: 400 }
    );
  }

  try {
    const project = await createProject({
      name,
      domain,
      userId: user.id,
    });

    return NextResponse.json({
      id: project.id,
      site_key: project.site_key,
      name: project.name,
      domain: project.domain,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    const needsMigration =
      msg.includes("relation") ||
      msg.includes("column") ||
      msg.includes("projects");
    return NextResponse.json(
      {
        error: needsMigration
          ? "Database is missing the projects table. Run supabase/schema-postgres.sql, then try again."
          : `Could not save website: ${msg}`,
      },
      { status: 500 }
    );
  }
}
