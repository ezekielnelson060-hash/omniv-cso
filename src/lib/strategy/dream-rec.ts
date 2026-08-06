import type { AIRecommendation, ArtistBrain } from "@/types";

/** North-star weekly move from the held Big Dream. */
export function dreamRecommendation(
  brain: ArtistBrain | null
): AIRecommendation | null {
  const dream = brain?.bigDream?.trim() || brain?.goals?.[0] || "";
  if (!dream) return null;
  return {
    id: "dream-weekly",
    title: "This week must serve the dream",
    summary: `We are watching. Until this week's action clearly serves the dream, the rest is noise: ${dream.slice(0, 140)}`,
    why: "Scattered effort feels like progress. It is not. We only rank what moves the held image.",
    impact: "High",
    difficulty: "Moderate",
    confidence: 88,
    expectedOutcome:
      "A concrete weekly action that shortens the path to the Big Dream instead of diluting it.",
    priority: 1,
    category: "Strategy",
    supportingData: dream.slice(0, 200),
    strategicFrame: "Hold it. Cut the rest.",
    timing: "This week",
    nextActions: [
      "Write the single highest-leverage action for the next 7 days",
      "Block calendar time before reactive DMs",
      "Review in Ziki if the action is unclear",
    ],
  };
}

export function resolveBigDream(brain: ArtistBrain | null): string {
  return brain?.bigDream?.trim() || brain?.goals?.[0] || "";
}
