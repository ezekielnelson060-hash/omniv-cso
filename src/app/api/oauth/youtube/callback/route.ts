import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://omniv-cso.vercel.app";

  if (!code) {
    return NextResponse.redirect(`${appUrl}/settings?oauth=youtube_error`);
  }

  // Token exchange + store in Supabase is next step after Google Cloud credentials exist.
  return NextResponse.redirect(`${appUrl}/settings?oauth=youtube_ok`);
}
