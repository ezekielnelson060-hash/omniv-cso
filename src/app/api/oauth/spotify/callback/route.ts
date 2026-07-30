import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://omniv-cso.vercel.app";

  if (error || !code) {
    return NextResponse.redirect(
      `${appUrl}/settings?oauth=spotify_error`
    );
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/settings?oauth=spotify_config`);
  }

  const redirectUri = `${appUrl}/api/oauth/spotify/callback`;
  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    console.error("Spotify token error", await tokenRes.text());
    return NextResponse.redirect(`${appUrl}/settings?oauth=spotify_token`);
  }

  // Tokens should be stored encrypted per-user in Supabase next.
  // For now redirect success so UI can mark Spotify connected.
  return NextResponse.redirect(`${appUrl}/settings?oauth=spotify_ok`);
}
