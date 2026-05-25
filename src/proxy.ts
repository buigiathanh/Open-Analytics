import { type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/session";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/app/:path*", "/api/sites"],
};
