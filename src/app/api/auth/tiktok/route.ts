import { NextResponse } from "next/server";
import {
  buildTikTokAuthorizeUrl,
  tiktokConfigured,
} from "@/lib/tiktok";
import { cookies } from "next/headers";

export async function GET() {
  if (!tiktokConfigured()) {
    return NextResponse.json(
      {
        error:
          "TikTok is not configured. Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET in Vercel.",
      },
      { status: 503 }
    );
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("tiktok_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const url = buildTikTokAuthorizeUrl(state);
  return NextResponse.redirect(url);
}
