import type { ArtistBrain, ArtistScore, AIRecommendation } from "@/types";
import { dreamRecommendation } from "@/lib/strategy/dream-rec";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function brainCompleteness(brain: ArtistBrain): number {
  let filled = 0;
  const checks = [
    brain.genre.length > 0 && brain.genre[0] !== "TBD",
    Boolean(brain.musicStyle && brain.musicStyle.length > 20),
    Boolean(brain.brandVoice && brain.brandVoice.length > 8),
    Boolean(brain.targetAudience && brain.targetAudience.length > 8),
    brain.goals.length > 0,
    brain.strengths.length > 0,
    brain.weaknesses.length > 0,
    Boolean(brain.contentStyle),
    Boolean(brain.careerStage),
    Boolean(brain.notes && brain.notes.length > 10),
  ];
  for (const c of checks) if (c) filled++;
  return filled / checks.length;
}

export type ScoreInputs = {
  platforms?: string[];
  interests?: string[];
};

export function computeScoresFromBrain(
  brain: ArtistBrain | null,
  platformsOrInputs: string[] | ScoreInputs = []
): ArtistScore {
  const inputs: ScoreInputs = Array.isArray(platformsOrInputs)
    ? { platforms: platformsOrInputs }
    : platformsOrInputs || {};
  const platforms = inputs.platforms || [];
  const interests = inputs.interests || [];

  if (!brain) {
    return {
      overall: 28,
      growth: 25,
      momentum: 22,
      audienceHealth: 20,
      releaseReadiness: 18,
      contentHealth: 24,
      fanGrowth: 20,
      streamingTrend: 18,
      socialGrowth: 22,
      opportunity: 30,
    };
  }

  const completeness = brainCompleteness(brain);
  const platformCount = platforms.length;
  const goalCount = brain.goals.length;
  const hasDream = Boolean(brain.bigDream?.trim() || goalCount > 0);

  const interestBoost = Math.min(interests.length * 3, 15);
  const platformBoost = Math.min(platformCount * 8, 32);
  const completeBoost = Math.round(completeness * 35);
  const dreamBoost = hasDream ? 8 : 0;

  const stageBoost =
    (
      {
        emerging: 4,
        developing: 8,
        breakthrough: 12,
        established: 14,
        legacy: 10,
      } as Record<string, number>
    )[brain.careerStage] ?? 0;

  const contentHealth = clamp(
    28 + completeBoost * 0.4 + interestBoost + (interests.includes("content") ? 6 : 0)
  );
  const audienceHealth = clamp(
    22 + platformBoost * 0.5 + completeBoost * 0.25 + (interests.includes("audience") ? 5 : 0)
  );
  const releaseReadiness = clamp(
    20 +
      completeBoost * 0.35 +
      stageBoost +
      (interests.includes("release") || interests.includes("playlist") ? 8 : 0) +
      dreamBoost
  );
  const growth = clamp(25 + platformBoost * 0.4 + interestBoost + dreamBoost * 0.5);
  const momentum = clamp(24 + completeBoost * 0.3 + platformBoost * 0.35 + stageBoost);
  const opportunity = clamp(30 + interestBoost + platformBoost * 0.25 + dreamBoost);
  const fanGrowth = clamp(audienceHealth * 0.85 + platformBoost * 0.15);
  const streamingTrend = clamp(releaseReadiness * 0.7 + growth * 0.3);
  const socialGrowth = clamp(contentHealth * 0.6 + audienceHealth * 0.4);
  const overall = clamp(
    overallFromParts({
      growth,
      momentum,
      audienceHealth,
      releaseReadiness,
      contentHealth,
      opportunity,
    })
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

function overallFromParts(p: {
  growth: number;
  momentum: number;
  audienceHealth: number;
  releaseReadiness: number;
  contentHealth: number;
  opportunity: number;
}) {
  return (
    p.growth * 0.18 +
    p.momentum * 0.18 +
    p.audienceHealth * 0.16 +
    p.releaseReadiness * 0.16 +
    p.contentHealth * 0.16 +
    p.opportunity * 0.16
  );
}

const INTEREST_CATEGORY: Record<string, string[]> = {
  content: ["Content"],
  release: ["Release", "Playlist"],
  playlist: ["Playlist", "Release"],
  live: ["Festival", "Market"],
  collab: ["Collab"],
  brand: ["Brand", "Strategy"],
  audience: ["Audience", "Growth"],
  monetise: ["Market", "Growth"],
};

export function buildRecommendationsFromBrain(
  brain: ArtistBrain | null,
  platforms: string[] = [],
  interests: string[] = [],
  completedIds: string[] = []
): AIRecommendation[] {
  const name = brain?.stageName || brain?.name || "your project";
  const rawGenre = brain?.genre?.filter((g) => g && g !== "TBD").join(" / ");
  const genre = rawGenre || "core";
  const genreLabel = rawGenre || "";
  const style = brain?.musicStyle?.trim() || "";
  const voice = brain?.brandVoice?.trim() || "";
  const dream = brain?.bigDream?.trim() || brain?.goals?.[0] || "";
  const scores = computeScoresFromBrain(brain, { platforms, interests });
  const done = new Set(completedIds);
  const recs: AIRecommendation[] = [];
  const dreamRec = dreamRecommendation(brain, scores);
  if (dreamRec && !done.has(dreamRec.id)) recs.push(dreamRec);

  if ((interests.includes("content") || interests.length === 0) && !done.has("content-system")) {
    const styleHint = style
      ? `Sound/style locked as “${style.slice(0, 60)}”.`
      : "Style still soft in Artist Brain — fill Music Style so posts stop sounding generic.";
    recs.push({
      id: "content-system",
      title: style
        ? `4 posts in the ${style.slice(0, 28)} lane this week`
        : `Build ${genreLabel ? genreLabel + " " : ""}content system this week`,
      summary: `${name}: ship 4 short-form pieces. Hooks in first 1.5s. ${styleHint}${
        dream ? ` Every post must point at “${dream.slice(0, 50)}”.` : ""
      }`,
      why: voice
        ? `Brand voice is “${voice.slice(0, 80)}”. Cadence compounds faster than one-off posts.`
        : "Cadence compounds faster than one-off posts. Confidence rises when style + voice are filled.",
      impact: "High",
      difficulty: "Moderate",
      confidence: clamp(
        50 +
          scores.contentHealth * 0.25 +
          (style ? 10 : 0) +
          (voice ? 8 : 0) +
          (platforms.length ? 5 : 0)
      ),
      expectedOutcome: "Measurable reach test within 14 days + clearer brand signal",
      priority: 2,
      category: "Content",
      platforms: platforms.slice(0, 3),
      timing: "This week",
      strategicFrame: "Cadence over virality",
      nextActions: [
        style
          ? `Lock 4 hooks that only fit ${style.slice(0, 40)}`
          : "Lock 4 hooks from catalogue or writing",
        "Film in one session",
        platforms.length
          ? `Post on ${platforms.slice(0, 2).join(" + ")}`
          : "Post on the two strongest platforms",
      ],
    });
  }

  if ((interests.includes("release") || interests.includes("playlist")) && !done.has("release-window")) {
    recs.push({
      id: "release-window",
      title: "Stress-test the next release window",
      summary: `Run release readiness for ${name} before spending the cycle.`,
      why: `Career stage: ${brain?.careerStage || "emerging"}. Release readiness is currently ${scores.releaseReadiness}%.`,
      impact: "High",
      difficulty: "Moderate",
      confidence: clamp(65 + scores.releaseReadiness * 0.3),
      expectedOutcome: "Clear Go / Caution / Hold before budget is spent",
      priority: 2,
      category: "Release",
      timing: "Before next spend",
      strategicFrame: "Timing is strategy",
      nextActions: [
        "Open Release Simulator",
        "List competing drops in the same week",
        "Decide Go, Caution, or Hold",
      ],
    });
  }

  if ((scores.audienceHealth < 50 || interests.includes("audience")) && !done.has("owned-audience")) {
    recs.push({
      id: "owned-audience",
      title: "Grow owned audience, not rented reach",
      summary: dream
        ? `“${dream.slice(0, 70)}” needs a list, not rented views. Move attention into Fan Gate.`
        : "Move attention from algorithmic feeds into a list you control.",
      why: "Platform reach can vanish overnight. Owned audience compounds toward the Big Dream.",
      impact: "High",
      difficulty: "Moderate",
      confidence: 78,
      expectedOutcome: "Weekly list growth and higher conversion on the next drop",
      priority: 3,
      category: "Audience",
      supportingData: (brain?.goals || []).slice(0, 2).join(" · "),
      timing: "Ongoing this month",
      strategicFrame: "Own the relationship",
      nextActions: [
        "Primary CTA on every post to Fan Gate",
        "One lead magnet tied to the next release",
        "Weekly review of fan tiers",
      ],
    });
  }

  if (platforms.length < 2 && !done.has("connect-platforms")) {
    recs.push({
      id: "connect-platforms",
      title: "Connect the platforms that feed the model",
      summary: "Scores and opportunities stay soft until live surfaces are linked.",
      why: "Empty inputs produce empty strategy. Managers need signal, not guesses.",
      impact: "Medium",
      difficulty: "Easy",
      confidence: 90,
      expectedOutcome:
        "Personalised scores and tighter opportunity ranking — confidence is high because the gap is observable",
      priority: 4,
      category: "Platform",
      timing: "Today",
      nextActions: ["Open Settings → Integrations", "Connect primary surfaces"],
    });
  }

  const preferred = new Set<string>();
  for (const i of interests) {
    for (const c of INTEREST_CATEGORY[i] || []) preferred.add(c);
  }

  return recs
    .map((r) => ({
      ...r,
      priority: preferred.has(String(r.category))
        ? r.priority
        : r.priority + 20,
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
  const dream = brain?.bigDream?.trim() || brain?.goals?.[0];
  if (dream && scores.overall < 45) {
    return `${name}: the Big Dream is set, but execution levers are still soft (${scores.overall}%). One weekly move beats ten ideas.`;
  }
  if (scores.releaseReadiness < scores.momentum - 8) {
    return `${name}${genre ? ` (${genre})` : ""}: momentum is ahead of release readiness (${scores.releaseReadiness}%). Closing that gap lifts overall fastest.`;
  }
  if (scores.opportunity > 60) {
    return `${name}: opportunity surface is strong (${scores.opportunity}%). Execute the top briefing before adding experiments.`;
  }
  if (scores.contentHealth < 45) {
    return `${name}: content health is the softest lever right now: a 14-day cadence will move scores more than new tools.`;
  }
  return `${name}: scores update from your profile, Big Dream, and platforms. Sharper data → sharper next moves.`;
}
