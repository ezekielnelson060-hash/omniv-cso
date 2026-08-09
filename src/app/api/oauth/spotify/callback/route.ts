import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * Spotify OAuth callback.
 * Stores connection metadata on profiles.platform_connections.
 * Refresh tokens kept server-side only (service role write).
 * Note: full Spotify for Artists chart series requires Spotify partner access;
 * Web API gives user identity + we pair with public popularity on catalogue URLs.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://omniv-cso.vercel.app";

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/settings?oauth=spotify_error`);
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

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
  };

  let externalId = "";
  let displayName = "";
  try {
    const meRes = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (meRes.ok) {
      const me = (await meRes.json()) as {
        id?: string;
        display_name?: string;
      };
      externalId = me.id || "";
      displayName = me.display_name || "";
    }
  } catch {
    /* non-fatal */
  }

  let userId: string | null = null;
  try {
    const sb = await createServerClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    userId = user?.id || null;
  } catch {
    userId = null;
  }

  if (!userId) {
    return NextResponse.redirect(`${appUrl}/settings?oauth=spotify_auth`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !service) {
    return NextResponse.redirect(`${appUrl}/settings?oauth=spotify_config`);
  }

  const admin = createClient(supabaseUrl, service, {
    auth: { persistSession: false },
  });

  const { data: profile } = await admin
    .from("profiles")
    .select("platforms, social_links, platform_connections")
    .eq("id", userId)
    .maybeSingle();

  const platforms = Array.isArray(profile?.platforms)
    ? [...profile!.platforms]
    : [];
  if (!platforms.map((p: string) => p.toLowerCase()).includes("spotify")) {
    platforms.push("spotify");
  }

  const social = {
    ...(typeof profile?.social_links === "object" && profile?.social_links
      ? profile.social_links
      : {}),
  } as Record<string, string>;
  if (externalId && !social.spotify) {
    social.spotify = `https://open.spotify.com/user/${externalId}`;
  }

  const prevConn =
    typeof profile?.platform_connections === "object" &&
    profile?.platform_connections
      ? (profile.platform_connections as Record<string, unknown>)
      : {};

  const expiresAt = new Date(
    Date.now() + (tokens.expires_in || 3600) * 1000
  ).toISOString();

  const platform_connections = {
    ...prevConn,
    spotify: {
      connected_at: new Date().toISOString(),
      expires_at: expiresAt,
      scope: tokens.scope || "",
      external_id: externalId,
      display_name: displayName,
      refresh_token: tokens.refresh_token || null,
      has_refresh: Boolean(tokens.refresh_token),
    },
  };

  const { error: upErr } = await admin
    .from("profiles")
    .update({
      platforms,
      social_links: social,
      platform_connections,
    })
    .eq("id", userId);

  if (upErr) {
    console.error("Spotify profile update", upErr.message);
    return NextResponse.redirect(`${appUrl}/settings?oauth=spotify_store`);
  }

  return NextResponse.redirect(`${appUrl}/settings?oauth=spotify_ok`);
}
