import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeTikTokCode,
  fetchTikTokUserInfo,
  tiktokConfigured,
} from "@/lib/tiktok";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media";
  const settingsUrl = `${appUrl}/settings?tiktok=`;

  if (!tiktokConfigured()) {
    return NextResponse.redirect(`${settingsUrl}not_configured`);
  }

  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const err = searchParams.get("error");

  if (err) {
    return NextResponse.redirect(
      `${settingsUrl}denied&reason=${encodeURIComponent(err)}`
    );
  }

  const cookieStore = await cookies();
  const expected = cookieStore.get("tiktok_oauth_state")?.value;
  cookieStore.delete("tiktok_oauth_state");

  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(`${settingsUrl}invalid_state`);
  }

  const token = await exchangeTikTokCode(code);
  if (!token.access_token) {
    return NextResponse.redirect(
      `${settingsUrl}token_failed&reason=${encodeURIComponent(
        token.error_description || token.error || "unknown"
      )}`
    );
  }

  let displayName = "TikTok user";
  try {
    const info = (await fetchTikTokUserInfo(token.access_token)) as {
      data?: { user?: { display_name?: string; open_id?: string } };
    };
    displayName = info?.data?.user?.display_name || displayName;
  } catch {
    /* profile optional */
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("platforms, social_links")
        .eq("id", user.id)
        .maybeSingle();

      const platforms: string[] = Array.isArray(profile?.platforms)
        ? [...profile.platforms]
        : [];
      if (!platforms.includes("tiktok")) platforms.push("tiktok");

      const social =
        profile?.social_links && typeof profile.social_links === "object"
          ? { ...(profile.social_links as Record<string, unknown>) }
          : {};

      social.tiktok = {
        connected: true,
        open_id: token.open_id,
        display_name: displayName,
        connected_at: new Date().toISOString(),
        // Do not store access_token in profiles long-term without encryption;
        // store a flag only for now.
      };

      await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          platforms,
          social_links: social,
          updated_at: new Date().toISOString(),
        });
    }
  } catch (e) {
    console.error("tiktok profile save", e);
  }

  return NextResponse.redirect(
    `${settingsUrl}connected&name=${encodeURIComponent(displayName)}`
  );
}
