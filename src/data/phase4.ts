import type {
  ContentAnalysis,
  ReleaseSimulation,
  StudioOutput,
  ViralPrediction,
} from "@/types";

export function simulateRelease(fileName: string): ReleaseSimulation {
  const isVideo = /\.(mp4|mov|webm)$/i.test(fileName);
  return {
    title: fileName.replace(/\.[^.]+$/, "") || "Untitled track",
    commercialPotential: isVideo ? 72 : 78,
    viralPotential: isVideo ? 81 : 69,
    genreFit: 84,
    playlistPotential: 76,
    audienceFit: 80,
    riskScore: 28,
    viralProbability: isVideo ? 0.34 : 0.22,
    bestReleaseDate: "Thursday, 28 Aug 2026",
    timingRationale:
      "Thu–Fri drops in your genre currently hold stronger first-48h playlist pickup. Avoid mid-month festival saturation weeks.",
    competition:
      "Two mid-tier alt-R&B peers scheduled soft singles the prior week — stagger by 5–7 days to reduce feed collision.",
    marketingStrategy: [
      "48h teaser cadence on TikTok + Reels using brand voice (intimate, sparse captions)",
      "Pitch three independent playlists in the Thu–Sun window",
      "Stories sequence for 30–45 day dormant cohort on release day",
      "YouTube Shorts repurpose of best-performing teaser within 24h",
      "Smart-link in bio + pinned comment with single clear CTA",
    ],
    budgetRecommendation:
      "Lean push: $400–800 paid boost on top organic cut only after organic >1.5% engagement. Skip broad awareness until playlist signals appear.",
    launchPlan: [
      {
        week: "T−14",
        focus: "Assets & pitching",
        actions: [
          "Lock cover + 15s teaser",
          "Prepare playlist one-sheets",
          "Schedule soft content runway",
        ],
      },
      {
        week: "T−7",
        focus: "Heat",
        actions: [
          "Daily short-form (process / lyric / silhouette)",
          "Seed trend-adjacent audio if available",
          "Confirm smart-link stack",
        ],
      },
      {
        week: "T−0",
        focus: "Drop",
        actions: [
          "Release Thu 00:00 local priority markets",
          "Stories re-engagement sequence",
          "Playlist follow-ups",
        ],
      },
      {
        week: "T+7",
        focus: "Extend",
        actions: [
          "Double-down on top-performing creative",
          "UGC prompt to core fans",
          "Assess paid boost threshold",
        ],
      },
    ],
  };
}

export function analyseContent(label: string): ContentAnalysis {
  return {
    sourceLabel: label || "Uploaded media",
    hookScore: 71,
    retentionScore: 64,
    editingScore: 78,
    storytellingScore: 69,
    emotionScore: 82,
    overall: 73,
    strengths: [
      "Strong emotional tone matching Artist Brain voice",
      "Visual grain and silhouette framing on-brand",
      "Audio bed sits well under spoken or sung line",
    ],
    improvements: [
      "Hook lands at ~2.4s — cut to first 1.2s of strongest moment",
      "Caption density is high; reduce to one poetic line",
      "End card has no clear smart-link CTA",
      "Thumbnail contrast is low on mobile preview",
    ],
    captions: [
      "late night, same frequency.",
      "if it hits, it stays.",
      "not louder — closer.",
    ],
    hashtags: [
      "#altrnb",
      "#darkpop",
      "#indiemusic",
      "#newmusic",
      "#novahex",
    ],
    titleSuggestions: [
      "NOVA HEX — process, not performance",
      "The line that wouldn't leave",
      "Afterglow (studio take)",
    ],
    bestPostingTimes: [
      "Thu 7–9pm local",
      "Sat 11am–1pm local",
      "Sun 8–10pm local",
    ],
    platformNotes:
      "TikTok: prioritise hook trim. Reels: keep vertical safe margins. YouTube Shorts: add platform-native caption burn-in.",
  };
}

export function predictViral(label: string): ViralPrediction {
  return {
    sourceLabel: label || "Media",
    engagement: 68,
    watchTime: 61,
    retention: 58,
    shares: 54,
    comments: 49,
    algorithmScore: 63,
    overallViral: 59,
    why: [
      "Emotion score is high relative to peers — algorithm favours completion on intimate content",
      "Genre cluster is active this week; distribution headroom exists",
      "Visual identity is consistent with prior posts that retained well",
    ],
    risks: [
      "Hook delay reduces early retention percentile",
      "No trend audio attachment — pure original may need stronger open",
      "Length above 28s may hurt For You distribution vs 12–18s cuts",
    ],
  };
}

export const studioPlatforms = [
  "Instagram",
  "TikTok",
  "X",
  "Threads",
  "LinkedIn",
  "Email",
  "Press release",
  "Music announcement",
  "Video script",
  "Ad copy",
] as const;

export function generateStudio(
  platform: string,
  brief: string
): StudioOutput {
  const b = brief.trim() || "the new single";
  const map: Record<string, string> = {
    Instagram: `late night frequency.\n\n${b} is out — link in bio.\n\nnot louder. closer.`,
    TikTok: `POV: the line that wouldn't leave your head.\n\n${b}\n\n#altrnb #newmusic #indiemusic`,
    X: `${b} is live.\n\nFor the ones who listen after midnight.\n\n[link]`,
    Threads: `Dropped something quiet on purpose.\n\n${b}\n\nIf it hits, it stays.`,
    LinkedIn: `New release note — ${b}.\n\nWe've been building a more intentional cadence: fewer drops, sharper creative, clearer conversion from short-form to streams.\n\nGrateful for everyone who's been in the process.`,
    Email: `Subject: ${b} is here\n\nHey —\n\nThe new one is live. Made for late nights and headphones.\n\nListen: [smart link]\n\nThank you for being early.\n— NOVA HEX`,
    "Press release": `FOR IMMEDIATE RELEASE\n\nNOVA HEX Returns with “${b}”\n\n[City] — Independent alt-R&B artist NOVA HEX today releases “${b},” a mid-tempo single leaning into intimate vocal stacks and cinematic production.\n\nThe track continues the visual and sonic language established on prior releases, prioritising emotional proximity over maximal volume.\n\nStream: [link]\nPress: [email]`,
    "Music announcement": `NOVA HEX — ${b}\nOut now on all platforms.\n\nPre-save / stream: [link]`,
    "Video script": `0.0–1.2s  CLOSE: mouth / waveform / single light\n1.2–5s    Lyric line on-screen, sparse\n5–12s     Silhouette performance, grain\n12–15s    Title card + smart-link cue\n\nVO (optional, whispered): “${b}.”`,
    "Ad copy": `Headline: Hear ${b}\nPrimary text: Late-night alt-R&B for headphones. Stream the new NOVA HEX single.\nCTA: Listen now`,
  };

  return {
    platform,
    content:
      map[platform] ??
      `${platform} copy for ${b} — aligned to brand voice (intimate, sparse, confident).`,
  };
}
