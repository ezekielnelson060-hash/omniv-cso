import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Genre-aware content angles for short-form.
 * Uses Artist Brain; pattern library until live TikTok chart API is wired.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized", sounds: [] }, { status: 401 });
    }

    let genre: string[] = [];
    let style = "";
    let stage = "";
    try {
      const { data: brain } = await supabase
        .from("artist_brains")
        .select("genre, music_style, brand_voice, career_stage, stage_name, name")
        .eq("user_id", user.id)
        .maybeSingle();
      genre = (brain?.genre as string[]) || [];
      style =
        String(brain?.music_style || brain?.brand_voice || "").trim() ||
        "contemporary";
      stage = String(brain?.career_stage || "emerging");
    } catch {
      /* soft */
    }

    const g = genre[0] || "pop";
    const gLabel = genre.slice(0, 2).join(" / ") || "your genre";

    const sounds = [
      {
        id: "hook-loop",
        label: "Loopable 8-bar hook",
        why: `In ${gLabel}, clips that restart cleanly get replays. Export a 7–12s loop of your strongest melodic bar.`,
        platform: "TikTok",
        action: "Use as original sound · post 3 angles same day",
      },
      {
        id: "lyric-drop",
        label: "Lyric-on-beat open",
        why: `Start on the line fans can mouth along. ${style} energy — text on screen in first 1s.`,
        platform: "Reels / Shorts",
        action: "Film vertical · caption is a question not a sales pitch",
      },
      {
        id: "duet-gap",
        label: "Duet / stitch gap",
        why: "Leave 1s of space after the drop so others can stitch reaction. Grows reach without ads.",
        platform: "TikTok",
        action: "Post master · pin comment “duet this”",
      },
      {
        id: "bpm-match",
        label: "BPM-matched trend",
        why: `Find a trending sound near your track BPM (or slow it in-app). Genre: ${g}. Stage: ${stage}.`,
        platform: "TikTok",
        action: "Search sounds in-app by mood → save 5 → shoot tomorrow",
      },
      {
        id: "release-tease",
        label: "Pre-save / room tease",
        why: "One clip should end on a soft CTA to your Omniv tip or room link — not every post.",
        platform: "All short-form",
        action: "Open Content studio → generate 3 captions",
      },
    ];

    return NextResponse.json({
      genre: genre,
      style,
      sounds,
      note: "Based on your Artist Brain (genre + stage). Use these as filming jobs today — then lock a release date so posts lead somewhere.",
    });
  } catch (e) {
    console.error("content/trending", e);
    return NextResponse.json({ error: "failed", sounds: [] }, { status: 500 });
  }
}
