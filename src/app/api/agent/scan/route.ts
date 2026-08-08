import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runAgentScan } from "@/lib/agent/scan";
import type { ArtistBrain, CatalogueRelease, CatalogueTrack } from "@/types";

export const runtime = "nodejs";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, platforms, interests, social_links")
      .eq("id", user.id)
      .maybeSingle();

    let brain: ArtistBrain | null = null;
    try {
      const { data: brainRow } = await supabase
        .from("artist_brains")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (brainRow) {
        brain = {
          name: (brainRow.name as string) || profile?.full_name || "Artist",
          stageName: (brainRow.stage_name as string) || undefined,
          genre: (brainRow.genre as string[]) || [],
          musicStyle: (brainRow.music_style as string) || undefined,
          brandVoice: (brainRow.brand_voice as string) || undefined,
          careerStage: (brainRow.career_stage as string) || undefined,
          goals: (brainRow.goals as string[]) || [],
          bigDream: (brainRow.big_dream as string) || undefined,
          strengths: (brainRow.strengths as string[]) || [],
          weaknesses: (brainRow.weaknesses as string[]) || [],
          notes: (brainRow.notes as string) || undefined,
        } as ArtistBrain;
      }
    } catch {
      /* optional */
    }

    const platforms = (profile?.platforms as string[]) || [];
    const socialLinks = (profile?.social_links as Record<string, string>) || {};
    const linkedCount =
      Object.values(socialLinks).filter((u) => (u || "").trim().length > 8)
        .length || platforms.length;

    let releases: CatalogueRelease[] = [];
    let tracks: CatalogueTrack[] = [];
    try {
      const { data: rel } = await supabase
        .from("catalogue_releases")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      releases = (rel || []).map((r) => ({
        id: String(r.id),
        userId: String(r.user_id),
        title: String(r.title),
        releaseType: r.release_type,
        status: r.status,
        releaseDate: r.release_date,
        primaryGenre: r.primary_genre,
        spotifyUrl: r.spotify_url,
        youtubeUrl: r.youtube_url,
      }));
    } catch {
      /* optional */
    }
    try {
      const { data: tr } = await supabase
        .from("catalogue_tracks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);
      tracks = (tr || []).map((r) => {
        let analysis = null;
        if (r.notes && String(r.notes).startsWith("{")) {
          try {
            analysis = JSON.parse(String(r.notes)).analysis;
          } catch {
            analysis = null;
          }
        }
        return {
          id: String(r.id),
          userId: String(r.user_id),
          title: String(r.title),
          durationSec: r.duration_sec,
          audioPath: r.audio_path,
          analysis,
        };
      });
    } catch {
      /* optional */
    }

    const fanCities: { city: string; count: number }[] = [];
    try {
      const { data: fans } = await supabase
        .from("fans")
        .select("city")
        .eq("user_id", user.id)
        .limit(500);
      const map = new Map<string, number>();
      for (const f of fans || []) {
        const c = (f.city || "").trim();
        if (!c) continue;
        map.set(c, (map.get(c) || 0) + 1);
      }
      for (const [city, count] of map) fanCities.push({ city, count });
    } catch {
      /* optional */
    }

    const result = runAgentScan({
      brain: brain
        ? {
            ...brain,
            name: brain.name || profile?.full_name || "Artist",
          }
        : null,
      releases,
      tracks,
      platforms,
      linkedSurfaces: linkedCount,
      fanCities,
    });

    // Persist inbox so Agent UI stays in sync after Scan now
    try {
      await supabase
        .from("profiles")
        .update({
          agent_inbox: {
            proposals: result.proposals,
            scannedAt: result.scannedAt,
            narrative: result.narrative,
          },
          agent_scanned_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    } catch {
      /* optional columns */
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error("agent scan", e);
    return NextResponse.json(
      { error: "scan_failed", proposals: [], narrative: "" },
      { status: 500 }
    );
  }
}
