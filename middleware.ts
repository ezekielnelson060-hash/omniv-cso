import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

/**
 * Skip middleware entirely for static assets, SEO files, and cron jobs.
 * Cron routes authenticate with CRON_SECRET inside the handler — no session needed.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|opengraph-image|twitter-image|icon|apple-icon|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?)$).*)",
  ],
};
