import type { ArtistBrain, ArtistScore, AIRecommendation } from "@/types";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/**
 * Live strategy scores derived from Artist Brain completeness +
 * onboarding signals. Replaces Nova Hex demo numbers.
 * When platform OAuth metrics land, fold them into these inputs.
 */
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
  const hasStyle = Boolean(brain.musicStyle && brain.musicStyle.length > 40);
  const hasAudience = Boolean(
    brain.targetAudience && !brain.targetAudience.includes("inferred")
  );
  const releaseCount = brain.pastReleases?.length ?? 0;

  const contentHealth = clamp(
    35 + platformBoost + (hasStyle ? 12 : 0) + goalCount * 3
  );
  const audienceHealth = clamp(
    28 + platformBoost * 0.8 + (hasAudience ? 18 : 4) + strengthCount * 2
  );
  const releaseReadiness = clamp(
    22 + releaseCount * 12 + (hasGenre ? 10 : 0) + (goalCount > 1 ? 8 : 0)
  );
  const momentum = clamp(
    32 + platformBoost + strengthCount * 4 - gapCount * 2
  );
  const growth = clamp(30 + platformBoost * 0.9 + goalCount * 5);
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
    40 + gapCount * 4 + (platforms.length < 3 ? 12 : 4)
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

export function buildRecommendationsFromBrain(
  brain: ArtistBrain | null,
  platforms: string[] = []
): AIRecommendation[] {
  const name = brain?.stageName || brain?.name || "your project";
  const recs: AIRecommendation[] = [];

  if (!platforms.includes("spotify")) {
    recs.push({
      id: "connect-spotify",
      title: `Connect Spotify catalogue for ${name}`,
      summary:
        "Without streaming signals, release readiness and playlist strategy stay approximate.",
      why: "Catalogue and listener geography unlock timing and pitch targets.",
      impact: "High",
      difficulty: "Easy",
      confidence: 92,
      expectedOutcome: "Live streaming trend + playlist opportunity scoring",
      priority: 1,
      category: "Platform",
      timeWindow: "This week",
      supportingData: `Platforms selected: ${platforms.join(", ") || "none"}`,
      alternative: "Manually paste top track links in Settings → Integrations",
    });
  }

  if (!platforms.includes("tiktok") && !platforms.includes("instagram")) {
    recs.push({
      id: "social-surface",
      title: "Establish one short-form content system",
      summary:
        "Independent growth is still content-led. Pick TikTok or Reels and ship a 14-day cadence.",
      why: "Social growth is the fastest lever before paid spend.",
      impact: "High",
      difficulty: "Moderate",
      confidence: 88,
      expectedOutcome: "Measurable reach experiments within 14 days",
      priority: 2,
      category: "Content",
      timeWindow: "Next 14 days",
    });
  }

  if (brain?.genre?.[0] === "TBD" || !brain?.genre?.length) {
    recs.push({
      id: "define-genre",
      title: "Lock primary genre + 2 reference acts",
      summary:
        "Ziki and the opportunity engine need a clear competitive set.",
      why: "Vague genre positioning weakens playlist and collab targeting.",
      impact: "Medium",
      difficulty: "Easy",
      confidence: 90,
      expectedOutcome: "Sharper Artist Brain + better opportunity ranking",
      priority: 3,
      category: "Brand",
      timeWindow: "Today",
    });
  }

  if ((brain?.pastReleases?.length ?? 0) === 0) {
    recs.push({
      id: "release-window",
      title: "Define next release window (even if TBC)",
      summary:
        "A dated target forces readiness work: assets, content, and pitch list.",
      why: "Release readiness is the largest score upside for emerging acts.",
      impact: "High",
      difficulty: "Moderate",
      confidence: 85,
      expectedOutcome: "Clear 6–8 week critical path",
      priority: 4,
      category: "Release",
      timeWindow: "This month",
    });
  }

  if (brain?.goals?.length) {
    recs.push({
      id: "goal-focus",
      title: `Protect focus: ${brain.goals[0]}`,
      summary:
        "Your top stated goal should drive this week's only non-negotiable.",
      why: "Scattered execution is the #1 independent career tax.",
      impact: "High",
      difficulty: "Easy",
      confidence: 80,
      expectedOutcome: "One shipped outcome aligned to stated goals",
      priority: 5,
      category: "Strategy",
      timeWindow: "This week",
      supportingData: brain.goals.join(" · "),
    });
  }

  if (recs.length === 0) {
    recs.push({
      id: "compound",
      title: "Double down on your strongest surface",
      summary:
        "Brain is seeded. Compound the platform with the highest current signal.",
      why: "Depth beats scatter once fundamentals exist.",
      impact: "Medium",
      difficulty: "Moderate",
      confidence: 75,
      expectedOutcome: "Clear weekly operating rhythm",
      priority: 1,
      category: "Growth",
      timeWindow: "Ongoing",
    });
  }

  return recs.sort((a, b) => a.priority - b.priority);
}

export function overallNarrative(scores: ArtistScore, brain: ArtistBrain | null): string {
  const name = brain?.stageName || brain?.name || "Your project";
  if (scores.releaseReadiness < scores.momentum) {
    return `${name}: momentum is ahead of release readiness. Close the readiness gap and overall moves into a stronger band.`;
  }
  if (scores.opportunity > 60) {
    return `${name}: opportunity surface is rich — prioritise the top briefing before adding new experiments.`;
  }
  return `${name}: scores reflect Artist Brain + connected surfaces. Deepen platform data to sharpen precision.`;
}
