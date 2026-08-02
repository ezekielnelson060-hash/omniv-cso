/**
 * Release Simulator — stress-test timing before burning a cycle.
 * Deterministic scoring from Artist Brain + user inputs; Ziki narrative optional on top.
 */

import type { ArtistBrain } from "@/types";
import { computeScoresFromBrain } from "@/lib/strategy/scores";

export type ReleaseWindowInput = {
  title: string;
  genre?: string;
  primaryMarket: string; // e.g. Lagos, London, Accra, Global EN
  releaseDate: string; // ISO date
  alternateDate?: string;
  positioning: string; // one-line positioning
  contentReady: boolean;
  ownedListReady: boolean;
  playlistPitchReady: boolean;
  budgetBand: "none" | "low" | "medium" | "high";
  competingNoise: "quiet" | "normal" | "crowded"; // user estimate of calendar density
  platforms: string[];
  notes?: string;
};

export type WindowScore = {
  date: string;
  label: string;
  readiness: number;
  timing: number;
  positioning: number;
  risk: number;
  overall: number;
  verdict: "Go" | "Caution" | "Hold";
  reasons: string[];
  blockers: string[];
};

export type SimulationResult = {
  artistName: string;
  primary: WindowScore;
  alternate: WindowScore | null;
  recommendation: string;
  checklist: string[];
  spendWarning: string;
  confidence: number;
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function dayOfWeek(iso: string): number {
  const d = new Date(iso + "T12:00:00");
  return Number.isNaN(d.getTime()) ? 5 : d.getDay(); // 0 Sun … 5 Fri
}

function daysFromNow(iso: string): number {
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return 14;
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function timingScore(
  iso: string,
  noise: ReleaseWindowInput["competingNoise"],
  releaseReadiness: number
): { score: number; reasons: string[]; blockers: string[] } {
  const reasons: string[] = [];
  const blockers: string[] = [];
  let score = 55;

  const lead = daysFromNow(iso);
  if (lead < 7) {
    score -= 25;
    blockers.push("Less than 7 days lead — assets and pitching rarely catch up.");
  } else if (lead < 14) {
    score -= 12;
    reasons.push("Tight 1–2 week lead; only works if content is already shot.");
  } else if (lead <= 45) {
    score += 15;
    reasons.push("Healthy 2–6 week runway for content + soft pitching.");
  } else if (lead <= 90) {
    score += 8;
    reasons.push("Long runway — protect focus so the campaign doesn’t go cold.");
  } else {
    score -= 8;
    reasons.push("Very far out — risk of context changing before drop.");
  }

  const dow = dayOfWeek(iso);
  // Fri (5) and Thu (4) often better for streaming culture; Mon weaker
  if (dow === 5 || dow === 4) {
    score += 8;
    reasons.push("Thu/Fri drop aligns with weekend listening patterns.");
  } else if (dow === 1) {
    score -= 6;
    reasons.push("Monday drops fight attention recovery after the weekend.");
  }

  if (noise === "crowded") {
    score -= 18;
    blockers.push("You marked the calendar crowded — differentiation must be sharp.");
  } else if (noise === "quiet") {
    score += 10;
    reasons.push("Quieter calendar raises odds of attention capture.");
  }

  if (releaseReadiness < 40) {
    score -= 10;
    blockers.push("Release readiness score is low — timing can’t fix incomplete prep.");
  }

  return { score: clamp(score), reasons, blockers };
}

function readinessScore(
  input: ReleaseWindowInput,
  brainScores: { releaseReadiness: number; contentHealth: number; audienceHealth: number }
): { score: number; reasons: string[]; blockers: string[] } {
  const reasons: string[] = [];
  const blockers: string[] = [];
  let score = 30 + brainScores.releaseReadiness * 0.35;

  if (input.contentReady) {
    score += 18;
    reasons.push("Content pack marked ready.");
  } else {
    score -= 12;
    blockers.push("Content not ready — do not burn paid or favours yet.");
  }

  if (input.ownedListReady) {
    score += 14;
    reasons.push("Owned list / fan gate ready to catch demand.");
  } else {
    score -= 8;
    blockers.push("No owned list — algorithm gains won’t convert to durable fans.");
  }

  if (input.playlistPitchReady) {
    score += 10;
    reasons.push("Pitch list prepared.");
  } else {
    reasons.push("Playlist pitch list still open — optional but valuable.");
  }

  if (input.platforms.length >= 2) {
    score += 8;
  } else {
    blockers.push("Fewer than 2 surfaces selected — distribution is thin.");
  }

  const budgetBoost = { none: 0, low: 4, medium: 8, high: 10 }[input.budgetBand];
  score += budgetBoost;

  if (brainScores.contentHealth < 40 && !input.contentReady) {
    blockers.push("Content health is soft and pack isn’t ready.");
  }

  return { score: clamp(score), reasons, blockers };
}

function positioningScore(
  input: ReleaseWindowInput,
  brain: ArtistBrain | null
): { score: number; reasons: string[]; blockers: string[] } {
  const reasons: string[] = [];
  const blockers: string[] = [];
  let score = 40;

  const pos = input.positioning.trim();
  if (pos.length > 40) {
    score += 20;
    reasons.push("Positioning is specific enough to guide creative.");
  } else if (pos.length > 12) {
    score += 8;
    reasons.push("Positioning exists but could be sharper.");
  } else {
    score -= 15;
    blockers.push("Vague positioning — easy to burn the week on the wrong story.");
  }

  const genre =
    input.genre ||
    brain?.genre?.filter((g) => g && g !== "TBD").join(" / ") ||
    "";
  if (genre) {
    score += 12;
    reasons.push(`Genre frame: ${genre}.`);
  } else {
    blockers.push("Genre unclear — playlists and content systems need a lane.");
  }

  if (input.primaryMarket && input.primaryMarket.length > 2) {
    score += 10;
    reasons.push(`Primary market: ${input.primaryMarket}.`);
  }

  if (brain?.brandVoice && brain.brandVoice.length > 10) {
    score += 8;
  }

  return { score: clamp(score), reasons, blockers };
}

function buildWindow(
  iso: string,
  label: string,
  input: ReleaseWindowInput,
  brain: ArtistBrain | null
): WindowScore {
  const brainScores = computeScoresFromBrain(brain, {
    platforms: input.platforms,
  });
  const timing = timingScore(iso, input.competingNoise, brainScores.releaseReadiness);
  const readiness = readinessScore(input, brainScores);
  const positioning = positioningScore(input, brain);

  const overall = clamp(
    readiness.score * 0.4 +
      timing.score * 0.35 +
      positioning.score * 0.25
  );
  const risk = clamp(100 - overall);

  const reasons = [
    ...readiness.reasons.slice(0, 2),
    ...timing.reasons.slice(0, 2),
    ...positioning.reasons.slice(0, 2),
  ];
  const blockers = [
    ...readiness.blockers,
    ...timing.blockers,
    ...positioning.blockers,
  ];

  let verdict: WindowScore["verdict"] = "Caution";
  if (overall >= 72 && blockers.length <= 1) verdict = "Go";
  else if (overall < 48 || blockers.length >= 3) verdict = "Hold";

  return {
    date: iso,
    label,
    readiness: readiness.score,
    timing: timing.score,
    positioning: positioning.score,
    risk,
    overall,
    verdict,
    reasons,
    blockers,
  };
}

export function simulateRelease(
  input: ReleaseWindowInput,
  brain: ArtistBrain | null
): SimulationResult {
  const artistName = brain?.stageName || brain?.name || "Your project";
  const primary = buildWindow(input.releaseDate, "Primary window", input, brain);
  const alternate = input.alternateDate
    ? buildWindow(input.alternateDate, "Alternate window", input, brain)
    : null;

  let recommendation: string;
  if (alternate && alternate.overall > primary.overall + 6) {
    recommendation = `Prefer the alternate window (${alternate.date}). Primary is weaker mainly on timing/readiness — burning ${primary.date} risks a half-ready drop.`;
  } else if (primary.verdict === "Go") {
    recommendation = `Primary window (${primary.date}) is viable if blockers stay closed. Protect the story: “${input.positioning.slice(0, 80)}”.`;
  } else if (primary.verdict === "Hold") {
    recommendation = `Do not spend this cycle on ${primary.date}. Fix blockers first — a quiet delay beats a loud miss.`;
  } else {
    recommendation = `Proceed only with constraints: close the top blockers, keep spend light until first 72h signal.`;
  }

  const checklist = [
    !input.contentReady ? "Finish 5–7 content assets before any paid push" : null,
    !input.ownedListReady ? "Ship fan gate link in bio / link-in-bio" : null,
    !input.playlistPitchReady ? "Build 8–12 curator pitch list" : null,
    input.positioning.trim().length < 20
      ? "Rewrite positioning in one sharp sentence"
      : null,
    "Define week-1 and week-2 content, not only drop day",
    "Decide kill criteria (when to stop boosting)",
  ].filter(Boolean) as string[];

  const spendWarning =
    primary.verdict === "Hold"
      ? "Do not run paid media on this window."
      : primary.verdict === "Caution"
        ? "Cap paid until organic signal appears in the first 48–72 hours."
        : "Paid is optional support — not a substitute for readiness.";

  const confidence = clamp(
    55 +
      (brain ? 15 : 0) +
      (input.contentReady ? 8 : 0) +
      (input.ownedListReady ? 6 : 0) +
      (input.positioning.length > 20 ? 6 : 0)
  );

  return {
    artistName,
    primary,
    alternate,
    recommendation,
    checklist,
    spendWarning,
    confidence,
  };
}

export function simulationToPrompt(result: SimulationResult, input: ReleaseWindowInput): string {
  return `You are Ziki, Omniv CSO. Turn this Release Simulator scorecard into a short executive briefing.

Artist: ${result.artistName}
Title: ${input.title}
Positioning: ${input.positioning}
Market: ${input.primaryMarket}
Primary date: ${result.primary.date} → overall ${result.primary.overall}/100, verdict ${result.primary.verdict}
${result.alternate ? `Alternate: ${result.alternate.date} → ${result.alternate.overall}/100` : "No alternate"}
Recommendation: ${result.recommendation}
Blockers: ${result.primary.blockers.join(" | ") || "none"}
Checklist: ${result.checklist.join(" | ")}

Write:
**Verdict**
**Why this window wins or loses**
**What to do in the next 7 days**
**What not to spend money on**
Keep it tight. No fake stream counts.`;
}
