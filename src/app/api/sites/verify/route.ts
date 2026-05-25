import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import {
  supabaseUrlFromProjectId,
  verifyUserAnalyticsProject,
} from "@/lib/supabase-project";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Dashboard is not configured." },
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

  let body: { supabaseProjectId?: string; supabaseAnonKey?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const projectId = body.supabaseProjectId?.trim();
  const publicKey = body.supabaseAnonKey?.trim();

  if (!projectId || !publicKey) {
    return NextResponse.json(
      { error: "Enter your Supabase project ID and publishable key." },
      { status: 400 }
    );
  }

  const supabaseUrl = supabaseUrlFromProjectId(projectId);
  if (!supabaseUrl) {
    return NextResponse.json(
      { error: "Invalid Supabase project ID or URL." },
      { status: 400 }
    );
  }

  const verified = await verifyUserAnalyticsProject(supabaseUrl, publicKey);
  if (!verified.ok) {
    return NextResponse.json({ error: verified.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
