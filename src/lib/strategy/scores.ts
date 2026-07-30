import type { ArtistBrain, ArtistScore, AIRecommendation } from "@/types";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function computeScoresFromBrain(
  brain: ArtistBrain | null,
  platforms: string[] = []
): ArtistScore {
  if (!brain) {
    return {
      overall: 28,
      growth: 30,
      momentum: 25,
      audienceHealth: 22,
      releaseReadiness: 18,
      contentHealth: 24,
      fanGrowth: 20,
      streamingTrend: 22,
      socialGrowth: 26,
      opportunity: 35,
    };
  }

  const platformBoost = Math.min(platforms.length * 6, 30);
  const hasGenre = brain.genre.length > 0 && brain.genre[0] !== "TBD";
  const goalCount = brain.goals.length;
  const strengthCount = brain.strengths.length;
  const gapCount = brain.weaknesses.length;
  const hasStyle = Boolean(brain.musicStyle && brain.musicStyle.length > 30);
  const hasAudience = Boolean(
    brain.targetAudience && !brain.targetAudience.includes("refined from")
  );
  const releaseCount = brain.pastReleases?.length ?? 0;
  const stageBoost =
    brain.careerStage === "emerging"
      ? 0
      : brain.careerStage === "developing"
        ? 6
        : brain.careerStage === "breakthrough"
          ? 12
          : 16;

  const contentHealth = clamp(
    35 + platformBoost + (hasStyle ? 12 : 0) + goalCount * 3
  );
  const audienceHealth = clamp(
    28 + platformBoost * 0.8 + (hasAudience ? 18 : 4) + strengthCount * 2
  );
  const releaseReadiness = clamp(
    22 +
      releaseCount * 12 +
      (hasGenre ? 10 : 0) +
      (goalCount > 1 ? 8 : 0) +
      stageBoost * 0.5
  );
  const momentum = clamp(
    32 + platformBoost + strengthCount * 4 - gapCount * 2 + stageBoost
  );
  const growth = clamp(30 + platformBoost * 0.9 + goalCount * 5 + stageBoost);
  const fanGrowth = clamp(25 + platformBoost + (hasAudience ? 10 : 0));
  const streamingTrend = clamp(
    24 + (platforms.includes("spotify") ? 18 : 4) + releaseCount * 6
  );
  const socialGrowth = clamp(
    28 +
      (platforms.includes("tiktok") || platforms.includes("instagram")
        ? 16
        : 4) +
      (hasStyle ? 8 : 0)
  );
  const opportunity = clamp(
    40 + gapCount * 4 + (platforms.length < 3 ? 12 : 4) + (hasGenre ? 8 : 0)
  );

  const overall = clamp(
    growth * 0.15 +
      momentum * 0.18 +
      audienceHealth * 0.15 +
      releaseReadiness * 0.15 +
      contentHealth * 0.12 +
      opportunity * 0.1 +
      fanGrowth * 0.05 +
      streamingTrend * 0.05 +
      socialGrowth * 0.05
  );

  return {
    overall,
    growth,
    momentum,
    audienceHealth,
    releaseReadiness,
    contentHealth,
    fanGrowth,
    streamingTrend,
    socialGrowth,
    opportunity,
  };
}

const INTEREST_CATEGORY: Record<string, string[]> = {
  content: ["Content", "Trend", "Platform"],
  release: ["Release"],
  playlist: ["Playlist"],
  live: ["Festival", "Market"],
  collab: ["Collab"],
  brand: ["Brand", "Strategy"],
  audience: ["Audience", "Growth"],
  monetise: ["Market", "Growth"],
};

export function buildRecommendationsFromBrain(
  brain: ArtistBrain | null,
  platforms: string[] = [],
  interests: string[] = []
): AIRecommendation[] {
  const name = brain?.stageName || brain?.name || "your project";
  const genre =
    brain?.genre?.filter((g) => g && g !== "TBD").join(" / ") || "your genre";
  const recs: AIRecommendation[] = [];

  if (interests.includes("content") || interests.length === 0) {
    recs.push({
      id: "content-system",
      title: `Build a ${genre} content system this week`,
      summary: `Ship 4 short-form pieces aligned to ${name}'s stated style — hooks in the first 1.5s.`,
      why: "Content focus was selected in onboarding; cadence compounds faster than one-off posts.",
      impact: "High",
      difficulty: "Moderate",
      confidence: 88,
      expectedOutcome: "Measurable reach test within 14 days",
      priority: 1,
      category: "Content",
      timeWindow: "This week",
      supportingData: `Style: ${brain?.musicStyle?.slice(0, 120) || "n/a"}`,
    });
  }

  if (interests.includes("release") || interests.includes("playlist")) {
    recs.push({
      id: "release-window",
      title: `Lock next ${genre} release window`,
      summary:
        "A dated target forces assets, content, and pitch list into one critical path.",
      why: `Career stage: ${brain?.careerStage || "emerging"}. Release readiness is the largest upside for acts at this level.`,
      impact: "High",
      difficulty: "Moderate",
      confidence: 86,
      expectedOutcome: "Clear 6–8 week path",
      priority: 2,
      category: "Release",
      timeWindow: "This month",
      supportingData: (brain?.goals || []).slice(0, 2).join(" · "),
    });
  }

  if (interests.includes("playlist")) {
    recs.push({
      id: "playlist-pitch",
      title: `Pitch independent ${genre} playlists`,
      summary:
        "Build a list of 8–12 curators that match your tempo and mood before the next drop.",
      why: "Playlist interest was selected — outreach only works with a defined sound.",
      impact: "High",
      difficulty: "Moderate",
      confidence: 78,
      expectedOutcome: "2–4 relevant submissions in the next window",
      priority: 3,
      category: "Playlist",
      timeWindow: "Thu–Sun cycle",
    });
  }

  if (interests.includes("audience")) {
    recs.push({
      id: "audience-cohort",
      title: "Re-engage quiet listeners",
      summary:
        "Target the 30–45 day dormant cohort with Stories + one exclusive snippet.",
      why: "Audience growth is a stated focus; recovery is cheaper than cold acquisition.",
      impact: "Medium",
      difficulty: "Easy",
      confidence: 80,
      expectedOutcome: "+ recovery of engaged listeners",
      priority: 4,
      category: "Audience",
      timeWindow: "This week",
    });
  }

  if (interests.includes("collab")) {
    recs.push({
      id: "collab",
      title: `Map 3 ${genre} collab targets`,
      summary:
        "Peer acts 0.7–1.5× your reach with overlapping audience are highest ROI.",
      why: "Collab interest selected in onboarding.",
      impact: "Medium",
      difficulty: "Hard",
      confidence: 72,
      expectedOutcome: "One warm conversation this month",
      priority: 5,
      category: "Collab",
      timeWindow: "30 days",
    });
  }

  if (interests.includes("live")) {
    recs.push({
      id: "live",
      title: "Soft-pitch 2 rooms or day parties",
      summary:
        "Match room size to current stage — overshooting kills conversion.",
      why: `Level: ${brain?.careerStage}. Live interest selected.`,
      impact: "Medium",
      difficulty: "Hard",
      confidence: 70,
      expectedOutcome: "One confirmed date or hold",
      priority: 6,
      category: "Festival",
      timeWindow: "Next 45 days",
    });
  }

  if (interests.includes("brand")) {
    recs.push({
      id: "brand",
      title: "Codify visual + voice rules",
      summary:
        "One-page brand sheet so every post and cover looks intentional.",
      why: `Voice: ${brain?.brandVoice || "not set"}. Brand focus selected.`,
      impact: "Medium",
      difficulty: "Easy",
      confidence: 84,
      expectedOutcome: "Consistent identity across surfaces",
      priority: 7,
      category: "Brand",
      timeWindow: "This week",
    });
  }

  if (interests.includes("monetise")) {
    recs.push({
      id: "monetise",
      title: "Pick one monetisation experiment",
      summary:
        "Merch, ticketed live, or paid community — one only this quarter.",
      why: "Monetisation focus selected; scatter dilutes signal.",
      impact: "High",
      difficulty: "Moderate",
      confidence: 74,
      expectedOutcome: "First revenue test designed",
      priority: 8,
      category: "Market",
      timeWindow: "This quarter",
    });
  }

  if (!platforms.includes("spotify") && platforms.length > 0) {
    recs.push({
      id: "spotify",
      title: "Add Spotify profile link",
      summary: "Streaming signals sharpen release and playlist scoring.",
      why: "Selected platforms omit Spotify.",
      impact: "High",
      difficulty: "Easy",
      confidence: 90,
      expectedOutcome: "Better Command Center precision",
      priority: 9,
      category: "Platform",
      timeWindow: "Today",
    });
  }

  if (brain?.goals?.[0]) {
    recs.push({
      id: "goal-1",
      title: `Protect focus: ${brain.goals[0]}`,
      summary: "Your #1 onboarding goal is this week's non-negotiable.",
      why: "Scattered execution is the independent career tax.",
      impact: "High",
      difficulty: "Easy",
      confidence: 82,
      expectedOutcome: "One shipped outcome on the primary goal",
      priority: 10,
      category: "Strategy",
      timeWindow: "This week",
      supportingData: brain.goals.join(" · "),
    });
  }

  if (recs.length === 0) {
    recs.push({
      id: "default",
      title: "Complete Artist Brain gaps",
      summary: "Add genre, goals, and platforms so the feed can personalise.",
      why: "Insufficient onboarding signal.",
      impact: "High",
      difficulty: "Easy",
      confidence: 95,
      expectedOutcome: "Accurate opportunity ranking",
      priority: 1,
      category: "Strategy",
      timeWindow: "Today",
    });
  }

  // Rank preferred interest categories higher
  const preferred = new Set<
    string
  >();
  for (const i of interests) {
    for (const c of INTEREST_CATEGORY[i] || []) preferred.add(c);
  }

  return recs
    .map((r, idx) => ({
      ...r,
      priority: preferred.has(String(r.category))
        ? r.priority
        : r.priority + 20,
      detectedAt: idx === 0 ? "Just now" : undefined,
    }))
    .sort((a, b) => a.priority - b.priority)
    .map((r, i) => ({ ...r, priority: i + 1 }));
}

export function overallNarrative(
  scores: ArtistScore,
  brain: ArtistBrain | null
): string {
  const name = brain?.stageName || brain?.name || "Your project";
  const genre = brain?.genre?.filter((g) => g !== "TBD").join(" / ");
  if (scores.releaseReadiness < scores.momentum) {
    return `${name}${genre ? ` (${genre})` : ""}: momentum is ahead of release readiness. Close the readiness gap and overall moves into a stronger band.`;
  }
  if (scores.opportunity > 60) {
    return `${name}: opportunity surface is rich — prioritise the top briefing before adding experiments.`;
  }
  return `${name}: scores reflect your onboarding profile. Deepen platform data to sharpen precision.`;
}
