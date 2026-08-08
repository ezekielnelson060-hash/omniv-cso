import type { AIRecommendation, ArtistBrain } from "@/types";

export function resolveBigDream(brain: ArtistBrain | null): string {
  return brain?.bigDream?.trim() || brain?.goals?.[0] || "";
}

/** North-star weekly move — personalised to stage + style + scores. */
export function dreamRecommendation(
  brain: ArtistBrain | null,
  scores?: { overall?: number; audienceHealth?: number; contentHealth?: number }
): AIRecommendation | null {
  const dream = resolveBigDream(brain);
  if (!dream) return null;

  const name = brain?.stageName || brain?.name || "you";
  const stage = brain?.careerStage || "emerging";
  const style = brain?.musicStyle?.trim() || "";
  const genre =
    brain?.genre?.filter((g) => g && g !== "TBD").join(" / ") || "";
  const overall = scores?.overall ?? 40;
  const audience = scores?.audienceHealth ?? 40;

  let nextActions: string[] = [];
  let strategicFrame = "Hold the image. Cut noise.";
  let title = "This week must serve the dream";
  let summary = "";

  if (stage === "emerging" || overall < 45) {
    title = `Prove the path to: ${dream.slice(0, 48)}${dream.length > 48 ? "…" : ""}`;
    summary = `${name} is early. This week is one proof step toward “${dream.slice(0, 80)}”. ${
      audience < 50
        ? "Owned list and one city signal matter more than vanity posts."
        : "Convert attention you already have into list + room proof."
    }`;
    nextActions = [
      style
        ? `Ship 1 piece that sounds unmistakably ${style.slice(0, 40)} — not generic`
        : "Ship 1 piece that only you could post",
      "Send every viewer to Fan Gate (owned list)",
      "Name the city/room size you can fill in 60 days",
    ];
    strategicFrame = "Proof over performance theatre";
  } else if (stage === "developing" || stage === "breakthrough") {
    title = `Compound toward: ${dream.slice(0, 48)}${dream.length > 48 ? "…" : ""}`;
    summary = `${name} has signal. This week must compound toward “${dream.slice(0, 80)}” — release timing, list growth, or a room that matches the dream scale.`;
    nextActions = [
      "Pick one lever: list, room, or release — not all three",
      genre
        ? `Align content to ${genre} listeners who would buy the ticket`
        : "Align content to ticket buyers, not passive scrollers",
      "Review in Ziki with the dream as the only scorecard",
    ];
    strategicFrame = "Compound, don't scatter";
  } else {
    title = `Protect the path: ${dream.slice(0, 48)}${dream.length > 48 ? "…" : ""}`;
    summary = `${name} at ${stage}: kill work that does not move “${dream.slice(0, 60)}”.`;
    nextActions = [
      "Audit this week's calendar against the dream",
      "Cut one commitment that does not serve it",
      "Double down on the single highest-leverage play",
    ];
    strategicFrame = "Edit the calendar to the dream";
  }

  const dreamClarity = Math.min(40, Math.floor(dream.length / 3));
  const profileBits =
    (genre ? 12 : 0) +
    (style ? 12 : 0) +
    (brain?.brandVoice ? 8 : 0) +
    (brain?.targetAudience ? 8 : 0) +
    (brain?.goals?.length ? 6 : 0);
  const confidence = Math.min(92, 45 + dreamClarity + profileBits);

  return {
    id: "dream-weekly",
    title,
    summary,
    why: `Your held image: “${dream}”. We only rank moves that shorten the path. Confidence reflects how complete the Artist Brain is — not a market guarantee.`,
    impact: "High",
    difficulty: "Moderate",
    confidence,
    expectedOutcome: `A 7-day action that a manager would defend as serving “${dream.slice(0, 60)}”.`,
    priority: 1,
    category: "Strategy",
    supportingData: `Stage ${stage} · overall ${overall}% · audience ${audience}%`,
    strategicFrame,
    timing: "This week",
    nextActions,
  };
}
