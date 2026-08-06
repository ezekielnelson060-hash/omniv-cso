import type { AIRecommendation, ArtistBrain } from "@/types";

/** North-star weekly move from the held Big Dream. */
export function dreamRecommendation(
  brain: ArtistBrain | null
): AIRecommendation | null {
  const dream = brain?.bigDream?.trim() || brain?.goals?.[0] || "";
  if (!dream) return null;
  return {
    id: "dream-weekly",
    title: "One move that compounds the Big Dream this week",
    summary: `Everything else is noise until this week's action clearly serves: ${dream.slice(0, 160)}`,
    why: "Managers sequence work against a held career image. Scattered effort feels busy and changes nothing.",
    impact: "High",
    difficulty: "Moderate",
    confidence: 88,
    expectedOutcome:
      "A concrete weekly action that shortens the path to the Big Dream instead of diluting it.",
    priority: 1,
    category: "Strategy",
    supportingData: dream.slice(0, 200),
    strategicFrame: "Hold the image. Cut the rest.",
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
