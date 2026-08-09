import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { metricsFromSpotifyUrl } from "@/lib/spotify/metrics";
import { trackServer } from "@/lib/analytics";

export const dynamic = "force-dynamic";

/**
 * POST /api/platform-metrics/refresh
 * Signed-in user: pull public Spotify popularity for their releases with spotify_url.
 * Fires after catalogue add with DSP link so Opportunities can densify without waiting for 08:00 cron.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      return NextResponse.json(
        { ok: false, skipped: true, reason: "spotify_env" },
        { status: 503 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !service) {
      return NextResponse.json({ error: "config" }, { status: 500 });
    }

    const admin = createAdmin(url, service, {
      auth: { persistSession: false },
    });

    const { data: releases, error } = await admin
      .from("catalogue_releases")
      .select("id, user_id, title, spotify_url")
      .eq("user_id", user.id)
      .not("spotify_url", "is", null)
      .limit(40);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let updated = 0;
    let failed = 0;
    let skipped = 0;

    for (const r of releases || []) {
      const spotifyUrl = (r.spotify_url || "").trim();
      if (!spotifyUrl) {
        skipped++;
        continue;
      }
      try {
        const m = await metricsFromSpotifyUrl(spotifyUrl);
        if (!m) {
          skipped++;
          continue;
        }
        const { error: upErr } = await admin.from("platform_metrics").upsert(
          {
            user_id: user.id,
            platform: "spotify",
            entity_type: m.entityType,
            entity_id: m.entityId,
            entity_url: m.externalUrl,
            title: m.title || r.title,
            popularity: m.popularity,
            followers: m.followers ?? null,
            extra: {
              ...m.extra,
              catalogue_release_id: r.id,
            },
            fetched_at: new Date().toISOString(),
          },
          { onConflict: "user_id,platform,entity_type,entity_id" }
        );
        if (upErr) {
          failed++;
        } else {
          updated++;
        }
      } catch {
        failed++;
      }
    }

    void trackServer({
      name: "dsp_metrics_refresh",
      userId: user.id,
      path: "/api/platform-metrics/refresh",
      meta: { updated, failed, skipped, scanned: (releases || []).length },
    });

    return NextResponse.json({
      ok: true,
      scanned: (releases || []).length,
      updated,
      failed,
      skipped,
    });
  } catch (e) {
    console.error("platform-metrics refresh", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
