import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute =
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/forgot-password");

  // Public: marketing, legal, fan gates, live rooms, audits, APIs
  const isPublic =
    path === "/" ||
    isAuthRoute ||
    path.startsWith("/_next") ||
    path.startsWith("/api/") ||
    path.startsWith("/g/") ||
    path === "/g" ||
    path.startsWith("/f/") ||
    path.startsWith("/audit") ||
    path.startsWith("/privacy") ||
    path.startsWith("/terms") ||
    path.startsWith("/contact") ||
    path.startsWith("/cookies") ||
    path.startsWith("/refund");

  if (!user && !isPublic) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  if (user && isAuthRoute) {
    const redirect = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get("next");
    redirect.pathname =
      next && next.startsWith("/") && !next.startsWith("//") ? next : "/crm";
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  return supabaseResponse;
}
