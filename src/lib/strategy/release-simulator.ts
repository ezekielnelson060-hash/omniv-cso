/**
 * Release Simulator — timing algorithms, competitor density, refined Go/Caution/Hold.
 */

import type { ArtistBrain } from "@/types";
import { computeScoresFromBrain } from "@/lib/strategy/scores";

export type ReleaseWindowInput = {
  title: string;
  genre?: string;
  primaryMarket: string;
  releaseDate: string;
  alternateDate?: string;
  positioning: string;
  contentReady: boolean;
  ownedListReady: boolean;
  playlistPitchReady: boolean;
  budgetBand: "none" | "low" | "medium" | "high";
  competingNoise: "quiet" | "normal" | "crowded";
  platforms: string[];
  notes?: string;
  /** Known competitor drops near the window (user-entered) */
  competitorDrops?: { name: string; date: string; lane?: string }[];
};

export type WindowScore = {
  date: string;
  label: string;
  readiness: number;
  timing: number;
  positioning: number;
  competition: number;
  risk: number;
  overall: number;
  verdict: "Go" | "Caution" | "Hold";
  reasons: string[];
  blockers: string[];
  strategyNotes: string[];
};

export type SimulationResult = {
  artistName: string;
  primary: WindowScore;
  alternate: WindowScore | null;
  recommendation: string;
  checklist: string[];
  spendWarning: string;
  confidence: number;
  competitorInsights: string[];
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function parseDate(iso: string): Date {
  return new Date(iso + "T12:00:00");
}

function dayOfWeek(iso: string): number {
  const d = parseDate(iso);
  return Number.isNaN(d.getTime()) ? 5 : d.getDay();
}

function daysFromNow(iso: string): number {
  const d = parseDate(iso);
  if (Number.isNaN(d.getTime())) return 14;
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function daysBetween(a: string, b: string): number {
  const da = parseDate(a).getTime();
  const db = parseDate(b).getTime();
  if (Number.isNaN(da) || Number.isNaN(db)) return 999;
  return Math.abs(Math.round((da - db) / (1000 * 60 * 60 * 24)));
}

/**
 * Timing model:
 * - Lead time curve (sweet spot ~14–45 days)
 * - Day-of-week bias (Thu/Fri preferred for streaming culture)
 * - Month-edge penalty (1st / month-end noise)
 * - User calendar density
 * - Brain release readiness
 */
function timingScore(
  iso: string,
  noise: ReleaseWindowInput["competingNoise"],
  releaseReadiness: number
): { score: number; reasons: string[]; blockers: string[] } {
  const reasons: string[] = [];
  const blockers: string[] = [];
  let score = 52;

  const lead = daysFromNow(iso);
  if (lead < 0) {
    score -= 40;
    blockers.push("Date is in the past.");
  } else if (lead < 7) {
    score -= 28;
    blockers.push("Under 7 days lead — pitching and content almost never catch up.");
  } else if (lead < 14) {
    score -= 14;
    reasons.push("Tight 1–2 week lead: only if content + pitches are already done.");
  } else if (lead <= 28) {
    score += 18;
    reasons.push("Optimal ~2–4 week runway for independent releases.");
  } else if (lead <= 45) {
    score += 14;
    reasons.push("Solid 4–6 week runway — protect focus so the campaign doesn’t go cold.");
  } else if (lead <= 90) {
    score += 4;
    reasons.push("Long runway — schedule soft content so momentum doesn’t lag.");
  } else {
    score -= 10;
    reasons.push("90+ days out — market context may shift before drop.");
  }

  const dow = dayOfWeek(iso);
  if (dow === 4 || dow === 5) {
    score += 9;
    reasons.push("Thu/Fri aligns with weekend listening and playlist refresh cycles.");
  } else if (dow === 0 || dow === 1) {
    score -= 7;
    reasons.push("Sun/Mon drops fight post-weekend attention recovery.");
  } else if (dow === 2 || dow === 3) {
    score += 2;
    reasons.push("Mid-week can work for focused niche audiences.");
  }

  const day = parseDate(iso).getDate();
  if (day <= 2 || day >= 28) {
    score -= 5;
    reasons.push("Month edge — more catalogue noise and weaker editorial attention.");
  }

  if (noise === "crowded") {
    score -= 16;
    blockers.push("Crowded calendar — you need a sharper story or a quieter week.");
  } else if (noise === "quiet") {
    score += 11;
    reasons.push("Quieter week raises odds of attention capture.");
  }

  if (releaseReadiness < 35) {
    score -= 12;
    blockers.push("Release readiness is too low for aggressive timing.");
  } else if (releaseReadiness > 70) {
    score += 6;
  }

  return { score: clamp(score), reasons, blockers };
}

function competitionScore(
  iso: string,
  input: ReleaseWindowInput
): { score: number; reasons: string[]; blockers: string[]; insights: string[] } {
  const reasons: string[] = [];
  const blockers: string[] = [];
  const insights: string[] = [];
  let score = 70; // higher = less competitive pressure

  const drops = input.competitorDrops || [];
  for (const c of drops) {
    const gap = daysBetween(iso, c.date);
    const sameLane =
      c.lane &&
      input.genre &&
      c.lane.toLowerCase().includes(input.genre.split(/[\/]/)[0]?.trim().toLowerCase() || "__");

    if (gap <= 3) {
      score -= sameLane ? 28 : 18;
      blockers.push(
        `${c.name} drops within ${gap} day(s)${sameLane ? " in a similar lane" : ""}.`
      );
      insights.push(
        `Avoid head-to-head with ${c.name} (${c.date}). Shift ±7–14 days or change positioning angle.`
      );
    } else if (gap <= 10) {
      score -= sameLane ? 14 : 8;
      reasons.push(`${c.name} is ${gap} days away — expect shared attention.`)
      insights.push(
        `Near ${c.name}: lean into differentiated angle, not the same hook pattern.`
      );
    } else if (gap <= 21) {
      score -= 4;
      insights.push(`${c.name} (${c.date}) is in the wider window — monitor, don’t panic.`)
    }
  }

  if (drops.length === 0) {
    reasons.push("No competitor drops logged — add known releases to raise confidence.");
    score -= 5; // slight uncertainty penalty
  }

  // Classic indie strategy heuristics
  insights.push(
    "Peer strategy: many independents win on Thu/Fri with 3+ weeks of short-form priming, not surprise dumps."
  );
  insights.push(
    "Avoid stacking your biggest content day on the same day a larger same-lane act posts a premiere."
  );

  return { score: clamp(score), reasons, blockers, insights };
}

function readinessScore(
  input: ReleaseWindowInput,
  brainScores: { releaseReadiness: number; contentHealth: number; audienceHealth: number }
): { score: number; reasons: string[]; blockers: string[] } {
  const reasons: string[] = [];
  const blockers: string[] = [];
  let score = 28 + brainScores.releaseReadiness * 0.35;

  if (input.contentReady) {
    score += 18;
    reasons.push("Content pack marked ready.");
  } else {
    score -= 14;
    blockers.push("Content not ready — do not burn paid or favours.");
  }

  if (input.ownedListReady) {
    score += 14;
    reasons.push("Owned list / fan gate ready.");
  } else {
    score -= 10;
    blockers.push("No owned list — algorithmic spikes won’t stick.");
  }

  if (input.playlistPitchReady) {
    score += 10;
    reasons.push("Pitch list prepared.");
  }

  if (input.platforms.length >= 2) score += 8;
  else blockers.push("Under 2 surfaces — distribution is thin.");

  score += { none: 0, low: 4, medium: 8, high: 10 }[input.budgetBand];

  if (brainScores.audienceHealth < 35 && !input.ownedListReady) {
    blockers.push("Weak audience health without an owned list is high risk.");
  }

  return { score: clamp(score), reasons, blockers };
}

function positioningScore(
  input: ReleaseWindowInput,
  brain: ArtistBrain | null
): { score: number; reasons: string[]; blockers: string[] } {
  const reasons: string[] = [];
  const blockers: string[] = [];
  let score = 38;

  const pos = input.positioning.trim();
  if (pos.length > 48) {
    score += 22;
    reasons.push("Positioning is specific enough to guide creative.");
  } else if (pos.length > 16) {
    score += 10;
    reasons.push("Positioning present but could be sharper.");
  } else {
    score -= 18;
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
    blockers.push("Genre unclear.");
  }

  if (input.primaryMarket && input.primaryMarket.length > 2) {
    score += 10;
    reasons.push(`Primary market: ${input.primaryMarket}.`);
  }

  if (brain?.brandVoice && brain.brandVoice.length > 10) score += 8;

  return { score: clamp(score), reasons, blockers };
}

/**
 * Verdict rules (refined):
 * Go     — overall ≥ 74, blockers ≤ 1, competition ≥ 45, readiness ≥ 55
 * Hold   — overall < 50 OR blockers ≥ 3 OR readiness < 35 OR competition < 30
 * Caution — everything else
 */
function verdictFrom(parts: {
  overall: number;
  blockers: string[];
  readiness: number;
  competition: number;
}): WindowScore["verdict"] {
  if (
    parts.overall < 50 ||
    parts.blockers.length >= 3 ||
    parts.readiness < 35 ||
    parts.competition < 30
  ) {
    return "Hold";
  }
  if (
    parts.overall >= 74 &&
    parts.blockers.length <= 1 &&
    parts.competition >= 45 &&
    parts.readiness >= 55
  ) {
    return "Go";
  }
  return "Caution";
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
  const competition = competitionScore(iso, input);

  const overall = clamp(
    readiness.score * 0.34 +
      timing.score * 0.28 +
      positioning.score * 0.2 +
      competition.score * 0.18
  );
  const risk = clamp(100 - overall);

  const reasons = [
    ...readiness.reasons.slice(0, 2),
    ...timing.reasons.slice(0, 2),
    ...positioning.reasons.slice(0, 1),
    ...competition.reasons.slice(0, 1),
  ];
  const blockers = [
    ...readiness.blockers,
    ...timing.blockers,
    ...positioning.blockers,
    ...competition.blockers,
  ];

  const verdict = verdictFrom({
    overall,
    blockers,
    readiness: readiness.score,
    competition: competition.score,
  });

  return {
    date: iso,
    label,
    readiness: readiness.score,
    timing: timing.score,
    positioning: positioning.score,
    competition: competition.score,
    risk,
    overall,
    verdict,
    reasons,
    blockers,
    strategyNotes: competition.insights.slice(0, 3),
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
    recommendation = `Prefer the alternate window (${alternate.date}, ${alternate.verdict}). Primary is weaker — burning ${primary.date} risks a half-ready or crowded drop.`;
  } else if (primary.verdict === "Go") {
    recommendation = `Primary window (${primary.date}) is a Go if blockers stay closed. Protect the story: “${input.positioning.slice(0, 90)}”.`;
  } else if (primary.verdict === "Hold") {
    recommendation = `Hold ${primary.date}. Fix blockers before spend — a quiet delay beats a loud miss.`;
  } else {
    recommendation = `Caution on ${primary.date}: close top blockers, keep spend light until first 72h signal.`;
  }

  const checklist = [
    !input.contentReady ? "Finish 5–7 content assets before any paid push" : null,
    !input.ownedListReady ? "Ship fan gate link in bio" : null,
    !input.playlistPitchReady ? "Build 8–12 curator pitch list" : null,
    input.positioning.trim().length < 20
      ? "Rewrite positioning in one sharp sentence"
      : null,
    (input.competitorDrops?.length || 0) === 0
      ? "Log 2–3 competitor drop dates in your lane"
      : null,
    "Define week-1 and week-2 content, not only drop day",
    "Set kill criteria for paid (when to stop boosting)",
  ].filter(Boolean) as string[];

  const spendWarning =
    primary.verdict === "Hold"
      ? "Do not run paid media on this window."
      : primary.verdict === "Caution"
        ? "Cap paid until organic signal appears in the first 48–72 hours."
        : "Paid is optional support — not a substitute for readiness.";

  const confidence = clamp(
    50 +
      (brain ? 12 : 0) +
      (input.contentReady ? 8 : 0) +
      (input.ownedListReady ? 6 : 0) +
      (input.positioning.length > 20 ? 6 : 0) +
      ((input.competitorDrops?.length || 0) > 0 ? 8 : 0)
  );

  const competitorInsights = [
    ...primary.strategyNotes,
    ...(alternate?.strategyNotes || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  return {
    artistName,
    primary,
    alternate,
    recommendation,
    checklist,
    spendWarning,
    confidence,
    competitorInsights,
  };
}

export function simulationToPrompt(
  result: SimulationResult,
  input: ReleaseWindowInput
): string {
  return `You are Ziki, Omniv CSO. Turn this Release Simulator scorecard into a short executive briefing.

Artist: ${result.artistName}
Title: ${input.title}
Positioning: ${input.positioning}
Market: ${input.primaryMarket}
Primary: ${result.primary.date} → ${result.primary.overall}/100 (${result.primary.verdict})
Competition score: ${result.primary.competition}/100
${result.alternate ? `Alternate: ${result.alternate.date} → ${result.alternate.overall}/100` : ""}
Recommendation: ${result.recommendation}
Blockers: ${result.primary.blockers.join(" | ") || "none"}
Competitor notes: ${result.competitorInsights.join(" | ")}

Write:
**Verdict**
**Timing vs competition**
**What to do in the next 7 days**
**What not to spend money on**
No fake stream counts.`;
}
