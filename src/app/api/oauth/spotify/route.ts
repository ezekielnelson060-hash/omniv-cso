import { NextResponse } from "next/server";

/**
 * Start Spotify OAuth (Authorization Code).
 * Requires SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET + NEXT_PUBLIC_APP_URL.
 * Register redirect: {APP_URL}/api/oauth/spotify/callback
 */
export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://omniv-cso.vercel.app";

  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "Spotify OAuth not configured. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.",
        setup:
          "https://developer.spotify.com/dashboard — create app, set redirect URI",
      },
      { status: 503 }
    );
  }

  const redirectUri = `${appUrl}/api/oauth/spotify/callback`;
  const scopes = [
    "user-read-email",
    "user-read-private",
    "user-top-read",
    "user-read-recently-played",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scopes,
    state: `omniv-${Date.now()}`,
  });

  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );
}
