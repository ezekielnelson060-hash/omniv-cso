import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media";

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/settings?oauth=facebook_error`);
  }

  const appId = process.env.FACEBOOK_APP_ID || process.env.META_APP_ID;
  const appSecret =
    process.env.FACEBOOK_APP_SECRET || process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    return NextResponse.redirect(`${appUrl}/settings?oauth=facebook_config`);
  }

  const redirectUri = `${appUrl}/api/oauth/facebook/callback`;
  const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id", appId);
  tokenUrl.searchParams.set("client_secret", appSecret);
  tokenUrl.searchParams.set("redirect_uri", redirectUri);
  tokenUrl.searchParams.set("code", code);

  const tokenRes = await fetch(tokenUrl.toString());
  if (!tokenRes.ok) {
    console.error("[facebook-oauth]", await tokenRes.text());
    return NextResponse.redirect(`${appUrl}/settings?oauth=facebook_token`);
  }

  // Store tokens per-user next; mark connected in UI for now
  return NextResponse.redirect(`${appUrl}/settings?oauth=facebook_ok`);
}
