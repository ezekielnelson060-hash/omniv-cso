import { NextResponse } from "next/server";

/**
 * Start Facebook Login (Authorization Code).
 * Env: FACEBOOK_APP_ID, FACEBOOK_APP_SECRET, NEXT_PUBLIC_APP_URL
 * Meta Valid OAuth Redirect URI must be exactly:
 *   {APP_URL}/api/oauth/facebook/callback
 */
export async function GET() {
  const appId = process.env.FACEBOOK_APP_ID || process.env.META_APP_ID;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media";

  if (!appId) {
    return NextResponse.json(
      {
        error:
          "Facebook Login not configured. Add FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in Vercel.",
        setup: "https://developers.facebook.com/apps — Facebook Login → Settings",
      },
      { status: 503 }
    );
  }

  const redirectUri = `${appUrl}/api/oauth/facebook/callback`;
  const scopes = [
    "email",
    "public_profile",
    // Instagram Graph / pages require App Review — request later when needed:
    // "instagram_basic", "pages_show_list", "instagram_manage_insights"
  ].join(",");

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state: `omniv-fb-${Date.now()}`,
    scope: scopes,
    response_type: "code",
  });

  return NextResponse.redirect(
    `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`
  );
}
