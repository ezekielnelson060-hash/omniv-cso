import type {
  AIRecommendation,
  ArtistBrain,
  CatalogueRelease,
  CatalogueTrack,
} from "@/types";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/** Opportunities from catalogue + calendar reality + linked platforms. */
export function worldOpportunitiesFromCatalogue(
  brain: ArtistBrain | null,
  releases: CatalogueRelease[],
  tracks: CatalogueTrack[],
  completedIds: string[] = [],
  platforms: string[] = []
): AIRecommendation[] {
  const done = new Set(completedIds);
  const name = brain?.stageName || brain?.name || "your project";
  const dream = brain?.bigDream?.trim() || brain?.goals?.[0] || "";
  const style = brain?.musicStyle?.trim() || "";
  const platLabel = platforms.filter(Boolean).slice(0, 2).join(" + ") || "";

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
      title: `Finish draft release: ${r.title.slice(0, 40)}`,
      summary: `Status is ${r.status}. Close the loop before opening a new idea.`,
      why: "Open drafts dilute focus. One released cut compounds harder than five unfinished ones.",
      impact: "High",
      difficulty: "Moderate",
      confidence: clamp(60 + (r.spotifyUrl ? 10 : 0) + (withAudio.length ? 10 : 0)),
      expectedOutcome: "Scheduled or released within 14 days",
      priority: 2,
      category: "Release",
      timing: "This fortnight",
      nextActions: [
        "Lock artwork and metadata",
        r.spotifyUrl ? "Confirm smart link CTA" : "Add distribution / Spotify URL when live",
        "Plan 3 clips before release day",
      ],
    });
  }

  if (releasedNoSpotify.length && !done.has("catalog-spotify-link")) {
    const r = releasedNoSpotify[0];
    recs.push({
      id: "catalog-spotify-link",
      title: `Add Spotify URL for “${r.title.slice(0, 36)}”`,
      summary: "Marked released without a listening link. Fans cannot complete the loop.",
      why: "Released without a destination wastes the campaign.",
      impact: "Medium",
      difficulty: "Easy",
      confidence: 88,
      expectedOutcome: "Smart link + Fan Gate CTA live",
      priority: 4,
      category: "Release",
      timing: "Today",
      nextActions: ["Paste Spotify URL in Catalogue", "Update Fan Gate primary CTA"],
    });
  }

  if ((day === 4 || day === 5 || day === 1 || day === 2) && !done.has("world-timing-window")) {
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

  if (platforms.length >= 1 && withAudio.length && !done.has("world-platform-push")) {
    recs.push({
      id: "world-platform-push",
      title: platLabel
        ? `Ship one clip on ${platLabel} for the strongest cut`
        : "Ship one clip on your strongest platform",
      summary: `${name} has analysed audio${platLabel ? ` and surfaces on ${platLabel}` : ""}. One platform-native clip beats a generic post.`,
      why: dream
        ? `Dream: “${dream.slice(0, 70)}”. Platform-native execution compounds faster than cross-posting the same asset.`
        : "Platform-native execution compounds faster than cross-posting the same asset.",
      impact: "High",
      difficulty: "Moderate",
      confidence: clamp(58 + (platforms.length >= 2 ? 12 : 0) + (style ? 8 : 0)),
      expectedOutcome: "One public clip with CTA to Fan Gate within 72 hours",
      priority: 3,
      category: "Content",
      platforms: platforms.slice(0, 3),
      timing: "This week",
      strategicFrame: "Native > mirrored",
      nextActions: [
        platLabel ? `Cut a 15s hook for ${platforms[0]}` : "Cut a 15s hook",
        "CTA every post → Fan Gate",
        "Log the post in Content after publish",
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
