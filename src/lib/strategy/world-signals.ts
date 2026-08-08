import type {
  AIRecommendation,
  ArtistBrain,
  CatalogueRelease,
  CatalogueTrack,
} from "@/types";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/** Opportunities from catalogue + calendar reality. */
export function worldOpportunitiesFromCatalogue(
  brain: ArtistBrain | null,
  releases: CatalogueRelease[],
  tracks: CatalogueTrack[],
  completedIds: string[] = []
): AIRecommendation[] {
  const done = new Set(completedIds);
  const name = brain?.stageName || brain?.name || "your project";
  const dream = brain?.bigDream?.trim() || brain?.goals?.[0] || "";
  const style = brain?.musicStyle?.trim() || "";
  const recs: AIRecommendation[] = [];
  const day = new Date().getDay();

  const unreleased = releases.filter(
    (r) => r.status === "draft" || r.status === "idea" || r.status === "scheduled"
  );
  const releasedNoSpotify = releases.filter(
    (r) => r.status === "released" && !r.spotifyUrl
  );
  const withAudio = tracks.filter((t) => t.analysis || t.audioPath);
  const hotTracks = tracks.filter(
    (t) => t.analysis?.energy === "hot" || t.analysis?.energy === "clipping"
  );

  if (withAudio.length && !done.has("catalog-audio-play")) {
    const t0 = withAudio[0];
    const bpm = t0.analysis?.bpm;
    recs.push({
      id: "catalog-audio-play",
      title: `Work the uploaded cut: ${t0.title.slice(0, 40)}`,
      summary: `${name} has audio in catalogue${bpm ? ` (~${bpm} BPM, ${t0.analysis?.energy || "energy n/a"})` : ""}. Turn it into a release or content play this week.`,
      why: dream
        ? `Held dream: “${dream.slice(0, 80)}”. Unheard analysed audio is dead inventory.`
        : "Unheard analysed audio is dead inventory.",
      impact: "High",
      difficulty: "Moderate",
      confidence: clamp(55 + (t0.analysis ? 20 : 0) + (style ? 10 : 0)),
      expectedOutcome: "One public surface (clip or smart link) within 7 days",
      priority: 2,
      category: "Release",
      timing: "This week",
      strategicFrame: "Ship or kill",
      nextActions: [
        `Open Ziki with “${t0.title}” and ask for a 7-day ship plan`,
        "Film one 15s hook from the strongest section",
        unreleased.length
          ? `Attach to draft “${unreleased[0].title}” and schedule`
          : "Create a draft single in Catalogue",
      ],
    });
  }

  if (unreleased.length && !done.has("catalog-finish-draft")) {
    const r = unreleased[0];
    recs.push({
      id: "catalog-finish-draft",
      title: `Finish draft: ${r.title.slice(0, 48)}`,
      summary: `Status is ${r.status}. ${r.spotifyUrl ? "Link exists — lock date and content spine." : "No streaming link yet — soft launch vs hold."}`,
      why: "Drafts without dates clog the system. Managers clear inventory weekly.",
      impact: "High",
      difficulty: "Moderate",
      confidence: 82,
      expectedOutcome: "Scheduled date or explicit Hold",
      priority: 3,
      category: "Release",
      timing: "Before next weekend",
      nextActions: [
        "Set release date or archive as idea",
        "List 3 content pieces tied to the title",
        "Run Release Simulator for that week",
      ],
    });
  }

  if (releasedNoSpotify.length && !done.has("catalog-link-spotify")) {
    recs.push({
      id: "catalog-link-spotify",
      title: "Link Spotify on released titles",
      summary: `${releasedNoSpotify.length} released item(s) missing Spotify URL. Discovery stays blind without the link.`,
      why: "Real-world ranking needs a surface URL.",
      impact: "Medium",
      difficulty: "Easy",
      confidence: 90,
      expectedOutcome: "Catalogue URLs complete → tighter opportunities",
      priority: 4,
      category: "Platform",
      timing: "Today",
      nextActions: [
        "Edit release → paste Spotify URL",
        "Re-run free audit on the link",
      ],
    });
  }

  if (!done.has("world-timing-window")) {
    const isWeekendPrep = day === 4 || day === 5;
    const isWeekStart = day === 1 || day === 2;
    if (isWeekendPrep || isWeekStart) {
      recs.push({
        id: "world-timing-window",
        title: isWeekendPrep
          ? "Lock weekend short-form before Friday night"
          : "Monday–Tuesday: pitch and list work, not only posts",
        summary: isWeekendPrep
          ? "Short-form peaks into weekends. Film/edit before Friday 6pm local."
          : "Outreach lands better early week. Use posts to support asks.",
        why: "Calendar heuristic, not a private DSP API — still higher leverage than random daily posting.",
        impact: "Medium",
        difficulty: "Easy",
        confidence: 70,
        expectedOutcome: "Time-aligned execution this week",
        priority: 5,
        category: "Strategy",
        timing: isWeekendPrep ? "Before Friday 18:00" : "Mon–Tue window",
        strategicFrame: "Time is a surface",
        nextActions: isWeekendPrep
          ? [
              "Batch 2–3 clips today",
              "Schedule posts Fri–Sun",
              "CTA every post → Fan Gate",
            ]
          : [
              "Send 3 outreach notes",
              "Update Fan Gate CTA",
              "One proof post, not five",
            ],
      });
    }
  }

  if (hotTracks.length && !done.has("catalog-hot-mix")) {
    recs.push({
      id: "catalog-hot-mix",
      title: `Check loudness on “${hotTracks[0].title.slice(0, 36)}”`,
      summary: "Passport flagged hot/clipping. Fix before paid push or playlist pitch.",
      why: "Clipped masters get skipped. Cheap to fix now.",
      impact: "Medium",
      difficulty: "Moderate",
      confidence: 75,
      expectedOutcome: "Cleaner master or intentional aesthetic decision",
      priority: 6,
      category: "Release",
      nextActions: [
        "Re-export with true-peak limit",
        "Compare to a genre reference",
        "Ask Ziki after re-upload",
      ],
    });
  }

  return recs;
}

export async function fetchSpotifyOEmbed(url: string): Promise<{
  title?: string;
  thumbnail_url?: string;
} | null> {
  try {
    const res = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(2500) }
    );
    if (!res.ok) return null;
    return (await res.json()) as { title?: string; thumbnail_url?: string };
  } catch {
    return null;
  }
}
