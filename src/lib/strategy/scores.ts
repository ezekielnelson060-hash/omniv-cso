import type { ArtistBrain, ArtistScore, AIRecommendation } from "@/types";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/** Brain completeness 0–1 — drives score sensitivity */
function brainCompleteness(brain: ArtistBrain): number {
  let filled = 0;
  const checks = [
    brain.genre.length > 0 && brain.genre[0] !== "TBD",
    Boolean(brain.musicStyle && brain.musicStyle.length > 20),
    Boolean(brain.brandVoice && brain.brandVoice.length > 8),
    Boolean(brain.targetAudience && brain.targetAudience.length > 12),
    brain.goals.length > 0,
    brain.strengths.length > 0,
    brain.competitors.length > 0,
    (brain.pastReleases?.length ?? 0) > 0,
    Boolean(brain.contentStyle),
    Boolean(brain.careerStage),
  ];
  for (const c of checks) if (c) filled += 1;
  return filled / checks.length;
}

export type ScoreInputs = {
  platforms?: string[];
  socialLinkCount?: number;
  interests?: string[];
  /** Days since last profile/scan activity */
  daysSinceActivity?: number | null;
};

/**
 * Dynamic multi-factor scoring.
 * Recomputes from live profile + brain; no static demo numbers.
 * OAuth metrics (streams, followers) plug in later as optional overlays.
 */
export function computeScoresFromBrain(
  brain: ArtistBrain | null,
  platformsOrInputs: string[] | ScoreInputs = []
): ArtistScore {
  const inputs: ScoreInputs = Array.isArray(platformsOrInputs)
    ? { platforms: platformsOrInputs }
    : platformsOrInputs;

  const platforms = inputs.platforms || [];
  const socialLinks = inputs.socialLinkCount ?? 0;
  const interests = inputs.interests || [];
  const idleDays = inputs.daysSinceActivity ?? null;

  if (!brain) {
    return {
      overall: 22,
      growth: 24,
      momentum: 20,
      audienceHealth: 18,
      releaseReadiness: 15,
      contentHealth: 20,
      fanGrowth: 16,
      streamingTrend: 18,
      socialGrowth: 20,
      opportunity: 28,
    };
  }

  const complete = brainCompleteness(brain);
  const platformBoost = Math.min(platforms.length * 5 + socialLinks * 4, 36);
  const hasGenre = brain.genre.length > 0 && brain.genre[0] !== "TBD";
  const goalCount = brain.goals.length;
  const strengthCount = brain.strengths.length;
  const gapCount = Math.max(brain.weaknesses.length, 1);
  const hasStyle = Boolean(brain.musicStyle && brain.musicStyle.length > 30);
  const hasAudience = Boolean(
    brain.targetAudience &&
      !brain.targetAudience.toLowerCase().includes("refined from") &&
      !brain.targetAudience.toLowerCase().includes("to be")
  );
  const releaseCount = brain.pastReleases?.length ?? 0;
  const interestBoost = Math.min(interests.length * 3, 15);

  const stageBoost =
    {
      emerging: 0,
      developing: 7,
      breakthrough: 14,
      established: 18,
      legacy: 20,
    }[brain.careerStage] ?? 0;

  // Activity decay: idle profiles lose a few points on momentum / growth
  const idlePenalty =
    idleDays == null ? 0 : idleDays > 21 ? 10 : idleDays > 10 ? 5 : 0;

  const contentHealth = clamp(
    28 +
      platformBoost * 0.6 +
      (hasStyle ? 14 : 0) +
      goalCount * 3 +
      complete * 18 +
      (interests.includes("content") ? 6 : 0)
  );

  const audienceHealth = clamp(
    24 +
      platformBoost * 0.7 +
      (hasAudience ? 16 : 2) +
      strengthCount * 3 +
      complete * 12 +
      (interests.includes("audience") ? 5 : 0)
  );

  const releaseReadiness = clamp(
    18 +
      releaseCount * 14 +
      (hasGenre ? 12 : 0) +
      (goalCount > 1 ? 8 : 0) +
      stageBoost * 0.6 +
      (interests.includes("release") || interests.includes("playlist") ? 8 : 0) +
      complete * 10
  );

  const momentum = clamp(
    26 +
      platformBoost +
      strengthCount * 4 -
      gapCount * 2 +
      stageBoost -
      idlePenalty +
      complete * 14
  );

  const growth = clamp(
    24 +
      platformBoost * 0.85 +
      goalCount * 5 +
      stageBoost +
      interestBoost -
      idlePenalty * 0.5 +
      complete * 12
  );

  const fanGrowth = clamp(
    22 +
      platformBoost * 0.5 +
      (hasAudience ? 12 : 0) +
      (platforms.includes("tiktok") || platforms.includes("instagram") ? 8 : 0)
  );

  const streamingTrend = clamp(
    20 +
      (platforms.includes("spotify") ? 20 : 3) +
      (platforms.includes("apple") ? 8 : 0) +
      releaseCount * 7 +
      socialLinks * 2
  );

  const socialGrowth = clamp(
    24 +
      (platforms.includes("tiktok") ? 12 : 0) +
      (platforms.includes("instagram") ? 10 : 0) +
      (platforms.includes("youtube") ? 8 : 0) +
      (hasStyle ? 8 : 0) +
      socialLinks * 3
  );

  // Opportunity rises when gaps exist but profile is defined enough to act
  const opportunity = clamp(
    32 +
      gapCount * 5 +
      (platforms.length < 3 ? 10 : 2) +
      (hasGenre ? 10 : 0) +
      interestBoost +
      complete * 15 -
      (complete < 0.3 ? 8 : 0)
  );

  const overall = clamp(
    growth * 0.14 +
      momentum * 0.16 +
      audienceHealth * 0.14 +
      releaseReadiness * 0.16 +
      contentHealth * 0.12 +
      opportunity * 0.1 +
      fanGrowth * 0.06 +
      streamingTrend * 0.06 +
      socialGrowth * 0.06
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
  const scores = computeScoresFromBrain(brain, { platforms, interests });

  if (interests.includes("content") || interests.length === 0) {
    recs.push({
      id: "content-system",
      title: `Build a ${genre} content system this week`,
      summary: `Ship 4 short-form pieces aligned to ${name}'s stated style — hooks in the first 1.5s.`,
      why: "Content focus was selected in onboarding; cadence compounds faster than one-off posts.",
      impact: "High",
      difficulty: "Moderate",
      confidence: clamp(70 + scores.contentHealth * 0.25),
      expectedOutcome: "Measurable reach test within 14 days",
      priority: 1,
      category: "Content",
      timeWindow: "This week",
      supportingData: `Style: ${brain?.musicStyle?.slice(0, 120) || "n/a"} · Content score ${scores.contentHealth}`,
    });
  }

  if (interests.includes("release") || interests.includes("playlist")) {
    recs.push({
      id: "release-window",
      title: `Lock next ${genre} release window`,
      summary:
        "A dated target forces assets, content, and pitch list into one critical path.",
      why: `Career stage: ${brain?.careerStage || "emerging"}. Release readiness is currently ${scores.releaseReadiness}/100.`,
      impact: "High",
      difficulty: "Moderate",
      confidence: clamp(68 + scores.releaseReadiness * 0.2),
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
      why: `Audience health ${scores.audienceHealth}/100 — recovery is cheaper than cold acquisition.`,
      impact: "Medium",
      difficulty: "Easy",
      confidence: clamp(72 + scores.audienceHealth * 0.15),
      expectedOutcome: "Recovery of engaged listeners",
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

  const preferred = new Set<string>();
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
  if (scores.releaseReadiness < scores.momentum - 8) {
    return `${name}${genre ? ` (${genre})` : ""}: momentum is ahead of release readiness (${scores.releaseReadiness}). Closing that gap lifts overall fastest.`;
  }
  if (scores.opportunity > 60) {
    return `${name}: opportunity surface is strong (${scores.opportunity}). Execute the top briefing before adding experiments.`;
  }
  if (scores.contentHealth < 45) {
    return `${name}: content health is the softest lever right now — a 14-day cadence will move scores more than new tools.`;
  }
  return `${name}: scores update from your profile, goals, and platforms. Sharper data → sharper next moves.`;
}
