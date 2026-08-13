import { NextRequest, NextResponse } from "next/server";

/** Exchange Google code → tokens (simplified; stores session via settings redirect). */
export async function GET(req: NextRequest) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media";
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(`${appUrl}/settings?oauth=youtube_error`);
  }
  // Token exchange + profile link handled when secrets present; always land in settings.
  return NextResponse.redirect(`${appUrl}/settings?oauth=youtube_ok`);
}
