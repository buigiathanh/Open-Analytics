import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  isAppServiceRoleConfigured,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import { getSiteForUser } from "@/lib/registry-sites";
import type { Site } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

export async function requireSiteOwner(
  siteId: string
): Promise<
  | { ok: true; user: User; site: Site }
  | { ok: false; response: NextResponse }
> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Dashboard is not configured." },
        { status: 503 }
      ),
    };
  }
  if (!isAppServiceRoleConfigured()) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY." },
        { status: 503 }
      ),
    };
  }

  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const registry = await createClient();
  const site = await getSiteForUser(registry, siteId, user.id);
  if (!site) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Site not found." }, { status: 404 }),
    };
  }

  return { ok: true, user, site };
}
