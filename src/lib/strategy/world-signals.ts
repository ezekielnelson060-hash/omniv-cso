import type {
  AIRecommendation,
  ArtistBrain,
  CatalogueRelease,
  CatalogueTrack,
} from "@/types";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export type FanCity = { city: string; count: number };

export type WorldSignalOptions = {
  platforms?: string[];
  fanCities?: FanCity[];
};

/** Opportunities from catalogue + calendar + platforms + fan cities. */
export function worldOpportunitiesFromCatalogue(
  brain: ArtistBrain | null,
  releases: CatalogueRelease[],
  tracks: CatalogueTrack[],
  completedIds: string[] = [],
  platformsOrOpts: string[] | WorldSignalOptions = []
): AIRecommendation[] {
  const opts: WorldSignalOptions = Array.isArray(platformsOrOpts)
    ? { platforms: platformsOrOpts }
    : platformsOrOpts || {};
  const platforms = opts.platforms || [];
  const fanCities = opts.fanCities || [];
  const done = new Set(completedIds);
  const name = brain?.stageName || brain?.name || "your project";
  const dream = brain?.bigDream?.trim() || brain?.goals?.[0] || "";
  const style = brain?.musicStyle?.trim() || "";
  const genre =
    brain?.genre?.filter((g) => g && g !== "TBD").join(" / ") || "";
  const platLabel = platforms.filter(Boolean).slice(0, 2).join(" + ") || "";
  const topCity = [...fanCities].sort((a, b) => b.count - a.count)[0];

  const recs: AIRecommendation[] = [];
  const day = new Date().getDay();

  const unreleased = releases.filter(
    (r) =>
      r.status === "draft" || r.status === "idea" || r.status === "scheduled"
  );
  const releasedNoSpotify = releases.filter(
    (r) => r.status === "released" && !r.spotifyUrl
  );
  const withAudio = tracks.filter((t) => t.analysis || t.audioPath);
  const hotTracks = tracks.filter(
    (t) => t.analysis?.energy === "hot" || t.analysis?.energy === "clipping"
  );
  const bpmTracks = withAudio.filter((t) => t.analysis?.bpm);
  const leadTrack = withAudio[0];
  const leadDraft = unreleased[0];

  if ((leadTrack || leadDraft) && !done.has("unreleased-ship-plan")) {
    const titleCut = (
      leadDraft?.title ||
      leadTrack?.title ||
      "untitled cut"
    ).slice(0, 36);
    const bpm = leadTrack?.analysis?.bpm;
    const energy = leadTrack?.analysis?.energy;
    const passportBits = [
      bpm ? `~${bpm} BPM` : null,
      energy || null,
      leadTrack?.durationSec
        ? `${Math.round(leadTrack.durationSec)}s`
        : null,
    ].filter(Boolean);
    const cityBit =
      topCity && topCity.count >= 2
        ? `${topCity.count} fans in ${topCity.city}`
        : null;
    const surfaceBit = platLabel || null;
    const outsideBits = [cityBit, surfaceBit, genre || null]
      .filter(Boolean)
      .join(" · ");

    recs.push({
      id: "unreleased-ship-plan",
      title: leadDraft
        ? `Ship plan: ${titleCut}`
        : `Unreleased ship plan: ${titleCut}`,
      summary: [
        passportBits.length
          ? `Passport: ${passportBits.join(" · ")}.`
          : "Audio in catalogue — lock passport by re-upload if soft.",
        outsideBits
          ? `Outside levers: ${outsideBits}.`
          : "Link platforms + capture fan cities so outside levers tighten.",
        dream ? `Tied to “${dream.slice(0, 48)}”.` : "",
      ]
        .filter(Boolean)
        .join(" "),
      why: "Unreleased inventory without a 7-day plan is dead weight. Passport + owned cities + surfaces are the only outside data you control before DSP live stats exist.",
      impact: "High",
      difficulty: "Moderate",
      confidence: clamp(
        58 +
          (leadTrack?.analysis ? 14 : 0) +
          (topCity && topCity.count >= 2 ? 10 : 0) +
          (platforms.length ? 8 : 0) +
          (style ? 5 : 0)
      ),
      expectedOutcome:
        "Date locked or explicit Hold + one native clip + Fan Gate CTA",
      priority: 1,
      category: "Release",
      platforms: platforms.slice(0, 3),
      timing: "This week",
      strategicFrame: "Ship plan before spend",
      supportingData: outsideBits || passportBits.join(" · ") || undefined,
      nextActions: [
        leadDraft
          ? `Set date or Hold on “${leadDraft.title.slice(0, 40)}” in Catalogue`
          : "Create a draft single in Catalogue and attach this cut",
        topCity && topCity.count >= 2
          ? `Open a room in ${topCity.city} before release week`
          : "Capture city on Fan Gate so the next scan can route a room",
        platLabel
          ? `Cut one ${platforms[0]}-native 15s hook from the strongest section`
          : "Link a primary surface in Settings, then cut one 15s hook",
        bpm
          ? `Note ~${bpm} BPM for sync / playlist briefs (Agent webhook graph)`
          : "Confirm BPM on passport for sync matching",
      ],
    });
  }

  if (
    withAudio.length &&
    !done.has("catalog-audio-play") &&
    done.has("unreleased-ship-plan")
  ) {
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

  if (unreleased.length && !done.has("catalog-finish-draft") && !leadTrack) {
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
      summary:
        "Passport flagged hot/clipping. Fix before paid push or playlist pitch.",
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

  const hasSpotify = platforms.some((p) => /spotify/i.test(p));
  const hasTikTok = platforms.some((p) => /tiktok/i.test(p));
  const hasIG = platforms.some((p) => /instagram|reels/i.test(p));
  const hasYT = platforms.some((p) => /youtube|shorts/i.test(p));

  if (
    platforms.length >= 1 &&
    withAudio.length &&
    !done.has("world-platform-push")
  ) {
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

  if (hasSpotify && withAudio.length && !done.has("world-spotify-saves")) {
    recs.push({
      id: "world-spotify-saves",
      title: "Drive first-week saves on Spotify",
      summary: `${name}: algorithmic lift follows save rate, not raw streams. Point owned fans at one cut.`,
      why: "Save rate is the controllable DSP signal managers can still force before editorial.",
      impact: "High",
      difficulty: "Moderate",
      confidence: clamp(62 + (style ? 8 : 0)),
      expectedOutcome: "Measurable save spike on the lead cut within 7 days",
      priority: 3,
      category: "Playlist",
      platforms: ["spotify"],
      timing: "This week",
      strategicFrame: "Saves > streams",
      nextActions: [
        "Pick one catalogue cut as the save target",
        "CTA every post → smart link → Save",
        "Ask Fan Gate list for one save, not five streams",
      ],
    });
  }

  if ((hasTikTok || hasIG) && withAudio.length && !done.has("world-tt-hooks")) {
    const plat = hasTikTok ? "TikTok" : "Reels";
    recs.push({
      id: "world-tt-hooks",
      title: `3-hook test on ${plat} this week`,
      summary:
        "Same 8–12s moment, three openings. Kill losers by completion after ~300 views.",
      why: "Platform-native sound tests beat mirrored cross-posts.",
      impact: "High",
      difficulty: "Moderate",
      confidence: clamp(60 + (style ? 10 : 0)),
      expectedOutcome: "One winning hook to double down on",
      priority: 3,
      category: "Content",
      platforms: hasTikTok ? ["tiktok"] : ["instagram"],
      timing: "This week",
      strategicFrame: "Test → kill → scale",
      nextActions: [
        "Cut 3 openings from the strongest catalogue section",
        "Post same caption style for clean comparison",
        "CTA every post → Fan Gate",
      ],
    });
  }

  if (hasYT && withAudio.length && !done.has("world-shorts-spine")) {
    recs.push({
      id: "world-shorts-spine",
      title: "YouTube Shorts spine: one cut, three angles",
      summary: "Shorts compounds when the same sound returns across a week.",
      why: "YouTube rewards series behaviour more than one-off dumps.",
      impact: "Medium",
      difficulty: "Moderate",
      confidence: 64,
      expectedOutcome: "3 Shorts from one catalogue moment this week",
      priority: 4,
      category: "Content",
      platforms: ["youtube"],
      timing: "This week",
      nextActions: [
        "Lock the 10s loop from the strongest track",
        "Film face / text / b-roll variants",
        "End screen → Fan Gate or smart link",
      ],
    });
  }

  if (bpmTracks.length && !done.has("world-sync-window")) {
    const t0 = bpmTracks[0];
    const bpm = t0.analysis?.bpm;
    recs.push({
      id: "world-sync-window",
      title: bpm
        ? `Sync window: ~${bpm} BPM cut ready`
        : "Prep a sync-ready cut from catalogue",
      summary: `${t0.title.slice(0, 40)} has a passport. Brief-ready inventory beats cold outreach. Partner webhooks can match this tempo.`,
      why: "Outside opportunity graph (webhooks + briefs) needs inventory that matches tempo and energy — no live DSP required.",
      impact: "High",
      difficulty: "Moderate",
      confidence: clamp(55 + (t0.analysis ? 15 : 0)),
      expectedOutcome: "One pitch-ready cut with BPM + energy noted",
      priority: 4,
      category: "Market",
      timing: "This fortnight",
      strategicFrame: "Inventory before outreach",
      nextActions: [
        "Confirm clean master (no clipping)",
        "Note BPM + energy in Catalogue",
        "Ask Ziki for a 4-line sync pitch",
      ],
    });
  }

  if (
    topCity &&
    topCity.count >= 2 &&
    (leadTrack || leadDraft) &&
    !done.has("world-city-room")
  ) {
    recs.push({
      id: "world-city-room",
      title: `Warm ${topCity.city} before the drop`,
      summary: `${topCity.count} owned fans tagged ${topCity.city}. Invite them before ad spend.`,
      why: "Geography is outside data you already own. Rooms convert list attention into proof.",
      impact: "High",
      difficulty: "Moderate",
      confidence: clamp(70 + Math.min(topCity.count, 15)),
      expectedOutcome: `Room live in ${topCity.city} with invite to the list`,
      priority: 2,
      category: "Audience",
      timing: "This week",
      strategicFrame: "Own the city first",
      nextActions: [
        `Create room · ${topCity.city}`,
        "Invite fans tagged that city",
        "Preview one unreleased hook inside the room",
      ],
    });
  }

  if (platforms.length >= 2 && !done.has("world-cross-surface")) {
    recs.push({
      id: "world-cross-surface",
      title: `Route ${platLabel || "surfaces"} → Fan Gate`,
      summary:
        "Multiple surfaces without a single owned CTA waste the week.",
      why: "Rented reach compounds only when it lands in a list you control.",
      impact: "High",
      difficulty: "Easy",
      confidence: 80,
      expectedOutcome: "One primary CTA across all active surfaces",
      priority: 3,
      category: "Audience",
      platforms: platforms.slice(0, 3),
      timing: "Today",
      nextActions: [
        "Set Fan Gate as primary link in bio",
        "Replace vague CTAs with one save/join ask",
        "Review fan cities for a room",
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
