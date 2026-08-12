import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildPredictiveReleaseCalendar } from "@/lib/strategy/release-calendar";
import type { ArtistBrain, CatalogueRelease } from "@/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/release/simulate
 * Score a drop window + content runway checklist (execution, not theatre).
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      title?: string;
      genre?: string;
    };
    const title = (body.title || "Untitled").trim() || "Untitled";
    const genreHint = (body.genre || "").trim();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let brain: ArtistBrain | null = null;
    try {
      const { data } = await supabase
        .from("artist_brains")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        brain = {
          name: String(data.name || data.stage_name || ""),
          stageName: data.stage_name ? String(data.stage_name) : undefined,
          genre: (data.genre as string[]) || [],
          subGenre: [],
          musicStyle: String(data.music_style || ""),
          brandVoice: String(data.brand_voice || ""),
          visualIdentity: "",
          targetAudience: "",
          careerStage:
            (data.career_stage as ArtistBrain["careerStage"]) || "emerging",
          strengths: [],
          weaknesses: [],
          goals: [],
          pastReleases: [],
          contentStyle: "",
          competitors: [],
          notes: "",
          lastUpdated: new Date().toISOString(),
        };
      }
    } catch {
      /* soft */
    }

    let releases: CatalogueRelease[] = [];
    try {
      const { data: rel } = await supabase
        .from("catalogue_releases")
        .select("id, title, status, release_date, release_type")
        .eq("user_id", user.id);
      releases = (rel || []).map((r) => ({
        id: r.id as string,
        userId: user.id,
        title: String(r.title || ""),
        status: (r.status as CatalogueRelease["status"]) || "draft",
        releaseDate: r.release_date ? String(r.release_date) : null,
        releaseType:
          (r.release_type as CatalogueRelease["releaseType"]) || "single",
      }));
    } catch {
      /* soft */
    }

    const windows = buildPredictiveReleaseCalendar(brain, releases);
    const best = windows.find((w) => w.verdict === "Go") || windows[0];
    const genre =
      genreHint ||
      brain?.genre?.filter((g) => g && g !== "TBD")[0] ||
      "your style";

    const checklist = [
      `T-14: Lock title “${title}” in Catalogue · set status scheduled`,
      `T-14 → T-10: Shoot 5 short clips (hook loop, lyric open, duet gap) for ${genre}`,
      "T-10: Share Fan Gate link on every bio — own the emails before the drop",
      "T-7: Post 2 non-sales clips (story / process) · soft tip link once only",
      "T-5: Open a listening room in your top fan city (or online room)",
      "T-3: Post release-date countdown · pin Fan Gate or tip link",
      "T-1: Confirm DSP / distributor delivery · final 15s hook live",
      "Day 0: Drop · one room reminder · tip link in bio for 48h",
      "Day +2: Thank superfans · ask “would attend” on next city",
    ];

    return NextResponse.json({
      title,
      genre,
      window: best
        ? `${best.weekLabel} · ${best.verdict} (${best.score}/100)`
        : "Pick a Friday in the next 3–5 weeks",
      score: best?.score ?? 60,
      reasons:
        best?.reasons || [
          "Friday-aligned weeks usually convert better for independents",
        ],
      culturalHooks: best?.culturalHooks || [],
      checklist,
      startIso: best?.startIso || null,
    });
  } catch (e) {
    console.error("release simulate", e);
    return NextResponse.json({ error: "Simulate failed" }, { status: 500 });
  }
}
