import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

/** Supabase SSR auth cookies look like sb-<ref>-auth-token (chunked with .0, .1). */
function hasSupabaseAuthCookie(request: NextRequest): boolean {
  for (const { name } of request.cookies.getAll()) {
    if (
      name.startsWith("sb-") &&
      (name.includes("-auth-token") || name.includes("auth-token"))
    ) {
      return true;
    }
  }
  return false;
}

function isPublicPath(path: string): boolean {
  const isAuthRoute =
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/forgot-password");

  // Type-specific permanent URLs rewrite to /p/:slug in next.config,
  // but middleware runs BEFORE rewrites — these must be public or
  // crawlers and guests get redirected to login (broken OG previews).
  return (
    path === "/" ||
    isAuthRoute ||
    path === "/sitemap.xml" ||
    path === "/robots.txt" ||
    path.startsWith("/_next") ||
    path.startsWith("/api/") ||
    path.startsWith("/g/") ||
    path === "/g" ||
    path.startsWith("/f/") ||
    path.startsWith("/tip/") ||
    path.startsWith("/audit") ||
    path.startsWith("/verify") ||
    path.startsWith("/explore") ||
    path.startsWith("/home") ||
    path.startsWith("/activity") ||
    path.startsWith("/following") ||
    path.startsWith("/profile") ||
    path.startsWith("/e/") ||
    path.startsWith("/p/") ||
    path.startsWith("/music/") ||
    path.startsWith("/video/") ||
    path.startsWith("/research/") ||
    path.startsWith("/product/") ||
    path.startsWith("/event/") ||
    path.startsWith("/opportunity/") ||
    path.startsWith("/publish") ||
    path.startsWith("/saved") ||
    path.startsWith("/privacy") ||
    path.startsWith("/terms") ||
    path.startsWith("/contact") ||
    path.startsWith("/cookies") ||
    path.startsWith("/refund") ||
    path.startsWith("/blog") ||
    path.startsWith("/partners") ||
    path.startsWith("/data-deletion") ||
    path.startsWith("/visibility-sprint") ||
    path === "/policy" ||
    path.startsWith("/opengraph-image") ||
    path.startsWith("/twitter-image") ||
    path === "/icon" ||
    path === "/apple-icon"
  );
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const path = request.nextUrl.pathname;
  const publicPath = isPublicPath(path);
  const hasAuthCookie = hasSupabaseAuthCookie(request);

  // Fast path: public page or API, no session cookies → no Supabase network call.
  // Protected routes without cookies still need the redirect branch below.
  if (publicPath && !hasAuthCookie) {
    return supabaseResponse;
  }

  // Protected route, no cookies → login redirect without hitting Supabase.
  if (!publicPath && !hasAuthCookie) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

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

  const isAuthRoute =
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/forgot-password");

  if (!user && !publicPath) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  if (user && path === "/") {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/home";
    return NextResponse.redirect(redirect);
  }

  if (user && isAuthRoute) {
    const redirect = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get("next");
    redirect.pathname =
      next && next.startsWith("/") && !next.startsWith("//") ? next : "/home";
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  return supabaseResponse;
}
