import { NextResponse } from "next/server";

/** YouTube via Google OAuth. Requires GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET. */
export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media";

  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "YouTube OAuth not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from Google Cloud Console.",
      },
      { status: 503 }
    );
  }

  const redirectUri = `${appUrl}/api/oauth/youtube/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
