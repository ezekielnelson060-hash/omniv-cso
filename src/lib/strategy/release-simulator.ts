/**
 * Release Simulator: competitor proximity, indie priming, Go/Caution/Hold.
 */

import type { ArtistBrain } from "@/types";
import { computeScoresFromBrain } from "@/lib/strategy/scores";

export type CompetitorDrop = {
  name: string;
  date: string;
  lane?: string;
  /** relative scale vs you: peer | larger | smaller */
  scale?: "peer" | "larger" | "smaller";
};

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
  competitorDrops?: CompetitorDrop[];
};

export type ProximityHit = {
  name: string;
  date: string;
  gapDays: number;
  /** negative = competitor before you; positive = after */
  direction: "before" | "same" | "after";
  band: "same_day" | "d1_3" | "d4_7" | "d8_14" | "d15_21" | "outside";
  sameLane: boolean;
  scale: "peer" | "larger" | "smaller";
  pressure: number; // 0–30 penalty contribution
};

export type WindowScore = {
  date: string;
  label: string;
  readiness: number;
  timing: number;
  positioning: number;
  competition: number;
  priming: number;
  risk: number;
  overall: number;
  verdict: "Go" | "Caution" | "Hold";
  reasons: string[];
  blockers: string[];
  strategyNotes: string[];
  proximityHits: ProximityHit[];
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
  primingPlan: string[];
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

function signedGap(yourDate: string, theirDate: string): number {
  const a = parseDate(yourDate).getTime();
  const b = parseDate(theirDate).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 999;
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}

function bandFor(absGap: number): ProximityHit["band"] {
  if (absGap === 0) return "same_day";
  if (absGap <= 3) return "d1_3";
  if (absGap <= 7) return "d4_7";
  if (absGap <= 14) return "d8_14";
  if (absGap <= 21) return "d15_21";
  return "outside";
}

function sameLane(c: CompetitorDrop, genre?: string): boolean {
  if (!c.lane || !genre) return false;
  const g = genre.split(/[/·,]/)[0]?.trim().toLowerCase() || "";
  if (!g) return false;
  return c.lane.toLowerCase().includes(g) || g.includes(c.lane.toLowerCase());
}

/**
 * Proximity pressure matrix (penalty points, higher = worse for you)
 * Same-lane + larger act amplifies; competitor AFTER you is slightly less bad
 * (you can take first-mover mindshare) than them dropping 1–3 days BEFORE you.
 */
function pressureFor(hit: Omit<ProximityHit, "pressure">): number {
  const base: Record<ProximityHit["band"], number> = {
    same_day: 22,
    d1_3: 16,
    d4_7: 10,
    d8_14: 5,
    d15_21: 2,
    outside: 0,
  };
  let p = base[hit.band];
  if (hit.sameLane) p *= 1.35;
  if (hit.scale === "larger") p *= 1.4;
  if (hit.scale === "smaller") p *= 0.75;
  if (hit.direction === "before" && hit.band !== "outside") p *= 1.15;
  if (hit.direction === "after" && (hit.band === "d1_3" || hit.band === "d4_7"))
    p *= 0.9;
  return Math.round(p);
}

function analyzeProximity(
  iso: string,
  input: ReleaseWindowInput
): { hits: ProximityHit[]; score: number; reasons: string[]; blockers: string[]; insights: string[] } {
  const reasons: string[] = [];
  const blockers: string[] = [];
  const insights: string[] = [];
  const hits: ProximityHit[] = [];
  let score = 78;

  for (const c of input.competitorDrops || []) {
    const signed = signedGap(iso, c.date);
    const abs = Math.abs(signed);
    const direction: ProximityHit["direction"] =
      signed === 0 ? "same" : signed > 0 ? "after" : "before";
    const dirFixed: ProximityHit["direction"] =
      signed === 0 ? "same" : signed > 0 ? "before" : "after";
    void direction;
    const band = bandFor(abs);
    const lane = sameLane(c, input.genre);
    const scale = c.scale || "peer";
    const partial = {
      name: c.name,
      date: c.date,
      gapDays: abs,
      direction: dirFixed,
      band,
      sameLane: lane,
      scale,
    };
    const pressure = pressureFor(partial);
    hits.push({ ...partial, pressure });
    score -= pressure;

    if (band === "same_day") {
      blockers.push(
        `${c.name} same day${lane ? " · same lane" : ""}${scale === "larger" ? " · larger act" : ""}.`
      );
      insights.push(
        `Hard conflict with ${c.name}. Move ±10–14 days or change the story so you are not comparable.`
      );
    } else if (band === "d1_3") {
      blockers.push(
        `${c.name} within ${abs}d (${dirFixed === "before" ? "they go first" : "you go first"})${lane ? ", same lane" : ""}.`
      );
      insights.push(
        dirFixed === "before"
          ? `${c.name} lands just before you. Expect attention debt. Either leapfrog earlier or wait until their peak cools (~10–14d).`
          : `You land before ${c.name}. Take first-mover posts, but don’t schedule your biggest spend on their premiere day.`
      );
    } else if (band === "d4_7") {
      reasons.push(`${c.name} is ${abs} days away: shared week attention.`);
      insights.push(
        `Within a week of ${c.name}: differentiate hook/format; avoid identical visual tropes.`
      );
    } else if (band === "d8_14") {
      insights.push(
        `${c.name} (${c.date}) is 1–2 weeks off. Monitor, slight calendar pressure.`
      );
    }
  }

  if ((input.competitorDrops || []).length === 0) {
    score -= 6;
    reasons.push("No competitor dates logged. Competition confidence is lower.");
    insights.push(
      "Log 2–3 peer/larger drops in your lane. Proximity math is only as good as the calendar you feed it."
    );
  }

  if (input.competingNoise === "crowded") {
    score -= 10;
    reasons.push("You marked the week crowded beyond named competitors.");
  } else if (input.competingNoise === "quiet") {
    score += 8;
  }

  hits.sort((a, b) => b.pressure - a.pressure);

  return {
    hits,
    score: clamp(score),
    reasons,
    blockers,
    insights,
  };
}

function primingScore(
  iso: string,
  input: ReleaseWindowInput
): { score: number; plan: string[]; reasons: string[]; blockers: string[] } {
  const lead = daysFromNow(iso);
  const reasons: string[] = [];
  const blockers: string[] = [];
  const plan: string[] = [];
  let score = 40;

  if (lead >= 21 && input.contentReady) {
    score += 30;
    reasons.push("Enough runway for a full priming arc with assets ready.");
  } else if (lead >= 14 && input.contentReady) {
    score += 18;
    reasons.push("Two-week priming possible if you post with discipline.");
  } else if (lead >= 14 && !input.contentReady) {
    score += 5;
    blockers.push("Runway exists but content pack is not ready. Priming will slip.");
  } else if (lead < 10) {
    score -= 15;
    blockers.push("Too little time for priming; drop will feel like a cold start.");
  }

  if (input.ownedListReady) {
    score += 12;
    reasons.push("Owned list can absorb priming CTAs.");
  } else {
    score -= 8;
    plan.push("Stand up fan gate before priming week so traffic is captured.");
  }

  if (input.platforms.includes("tiktok") || input.platforms.includes("instagram")) {
    score += 8;
  } else {
    plan.push("Add at least one short-form surface for priming loops.");
  }

  if (lead >= 21) {
    plan.push("W-3: 2–3 process/teaser posts (no full chorus). Seed curiosity only.");
    plan.push("W-2: Hook tests: 2 cuts of the same idea; kill the weaker format.");
    plan.push("W-1: Pre-save / fan-gate push + one story-led piece.");
    plan.push("Drop day: 1 primary asset + 2 native variants, not five unfocused posts.");
    plan.push("W+1: Reply-driven content from early comments; soft playlist follow-up.");
  } else if (lead >= 10) {
    plan.push("Next 72h: lock one hook and shoot 3 variants.");
    plan.push("Days −7 to −3: daily short-form, same visual system.");
    plan.push("Day −1: owned list + pre-save only, no new creative experiments.");
    plan.push("Drop + 48h: double down on the format that got saves, not vanity views.");
  } else {
    plan.push("Emergency path: one strong asset, owned list only, zero broad paid until signal.");
  }

  plan.push(
    "Indie pattern: priming beats surprise dumps when you lack catalogue gravity."
  );
  plan.push(
    "Don’t peak your best content on a larger same-lane act’s premiere day."
  );

  return { score: clamp(score), plan: plan.slice(0, 7), reasons, blockers };
}

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
    blockers.push("Under 7 days lead. Pitching and content almost never catch up.");
  } else if (lead < 14) {
    score -= 14;
    reasons.push("Tight 1–2 week lead: only if content + pitches are already done.");
  } else if (lead <= 28) {
    score += 18;
    reasons.push("Optimal ~2–4 week runway for independent releases.");
  } else if (lead <= 45) {
    score += 14;
    reasons.push("Solid 4–6 week runway. Protect focus so the campaign doesn’t go cold.");
  } else if (lead <= 90) {
    score += 4;
    reasons.push("Long runway. Schedule soft content so momentum doesn’t lag.");
  } else {
    score -= 10;
    reasons.push("90+ days out. Market context may shift before drop.");
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
    reasons.push("Month edge: more catalogue noise and weaker editorial attention.");
  }

  if (noise === "crowded") {
    score -= 12;
  } else if (noise === "quiet") {
    score += 10;
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
    blockers.push("Content not ready. Do not burn paid or favours.");
  }

  if (input.ownedListReady) {
    score += 14;
    reasons.push("Owned list / fan gate ready.");
  } else {
    score -= 10;
    blockers.push("No owned list. Algorithmic spikes won’t stick.");
  }

  if (input.playlistPitchReady) {
    score += 10;
    reasons.push("Pitch list prepared.");
  }

  if (input.platforms.length >= 2) score += 8;
  else blockers.push("Under 2 surfaces. Distribution is thin.");

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
    blockers.push("Vague positioning: easy to burn the week on the wrong story.");
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

function verdictFrom(parts: {
  overall: number;
  blockers: string[];
  readiness: number;
  timing: number;
  competition: number;
  priming: number;
  proximityHits: ProximityHit[];
}): WindowScore["verdict"] {
  const lethal = parts.proximityHits.some(
    (h) =>
      h.band === "same_day" &&
      h.sameLane &&
      (h.scale === "larger" || h.scale === "peer")
  );

  if (
    lethal ||
    parts.overall < 52 ||
    parts.blockers.length >= 3 ||
    parts.readiness < 40 ||
    parts.competition < 35 ||
    (parts.priming < 35 && parts.timing < 50)
  ) {
    return "Hold";
  }

  if (
    parts.overall >= 76 &&
    parts.blockers.length <= 1 &&
    parts.readiness >= 58 &&
    parts.timing >= 55 &&
    parts.competition >= 50 &&
    parts.priming >= 50
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
  const competition = analyzeProximity(iso, input);
  const priming = primingScore(iso, input);

  const overall = clamp(
    readiness.score * 0.28 +
      timing.score * 0.22 +
      positioning.score * 0.16 +
      competition.score * 0.18 +
      priming.score * 0.16
  );
  const risk = clamp(100 - overall);

  const reasons = [
    ...readiness.reasons.slice(0, 2),
    ...timing.reasons.slice(0, 2),
    ...priming.reasons.slice(0, 1),
    ...competition.reasons.slice(0, 1),
  ];
  const blockers = [
    ...readiness.blockers,
    ...timing.blockers,
    ...positioning.blockers,
    ...competition.blockers,
    ...priming.blockers,
  ];

  const verdict = verdictFrom({
    overall,
    blockers,
    readiness: readiness.score,
    timing: timing.score,
    competition: competition.score,
    priming: priming.score,
    proximityHits: competition.hits,
  });

  return {
    date: iso,
    label,
    readiness: readiness.score,
    timing: timing.score,
    positioning: positioning.score,
    competition: competition.score,
    priming: priming.score,
    risk,
    overall,
    verdict,
    reasons,
    blockers,
    strategyNotes: [
      ...competition.insights.slice(0, 3),
      ...priming.plan.slice(0, 2),
    ],
    proximityHits: competition.hits,
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

  const priming = primingScore(input.releaseDate, input);

  let recommendation: string;
  if (alternate && alternate.overall > primary.overall + 6) {
    recommendation = `Prefer the alternate window (${alternate.date}, ${alternate.verdict}). Primary is weaker on timing, competition, or priming. Burning ${primary.date} risks a half-ready or contested drop.`;
  } else if (primary.verdict === "Go") {
    recommendation = `Primary window (${primary.date}) is a Go if blockers stay closed. Run the priming plan; protect the story: “${input.positioning.slice(0, 90)}”.`;
  } else if (primary.verdict === "Hold") {
    recommendation = `Hold ${primary.date}. Fix readiness, proximity conflicts, or priming gaps before spend. A quiet delay beats a loud miss.`;
  } else {
    recommendation = `Caution on ${primary.date}: close top blockers, follow a thin priming arc, keep spend light until first 72h signal.`;
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
    primary.proximityHits.some((h) => h.band === "same_day" || h.band === "d1_3")
      ? "Resolve near-term competitor conflict (shift date or reposition)"
      : null,
    "Define week-1 and week-2 content, not only drop day",
    "Set kill criteria for paid (when to stop boosting)",
  ].filter(Boolean) as string[];

  const spendWarning =
    primary.verdict === "Hold"
      ? "Do not run paid media on this window."
      : primary.verdict === "Caution"
        ? "Cap paid until organic signal appears in the first 48–72 hours."
        : "Paid is optional support, not a substitute for priming + readiness.";

  const confidence = clamp(
    48 +
      (brain ? 12 : 0) +
      (input.contentReady ? 8 : 0) +
      (input.ownedListReady ? 6 : 0) +
      (input.positioning.length > 20 ? 6 : 0) +
      ((input.competitorDrops?.length || 0) > 0 ? 10 : 0) +
      (primary.proximityHits.length > 0 ? 4 : 0)
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
    primingPlan: priming.plan,
  };
}

export function simulationToPrompt(
  result: SimulationResult,
  input: ReleaseWindowInput
): string {
  const hits = result.primary.proximityHits
    .slice(0, 5)
    .map(
      (h) =>
        `${h.name} ${h.date} gap=${h.gapDays}d ${h.direction} band=${h.band} lane=${h.sameLane} pressure=${h.pressure}`
    )
    .join(" | ");

  return `You are Ziki, Omniv CSO. Turn this Release Simulator scorecard into a short executive briefing.

Artist: ${result.artistName}
Title: ${input.title}
Positioning: ${input.positioning}
Market: ${input.primaryMarket}
Primary: ${result.primary.date} → ${result.primary.overall}/100 (${result.primary.verdict})
Readiness ${result.primary.readiness} · Timing ${result.primary.timing} · Competition ${result.primary.competition} · Priming ${result.primary.priming}
Proximity: ${hits || "none logged"}
Recommendation: ${result.recommendation}
Priming plan: ${result.primingPlan.join(" | ")}
Blockers: ${result.primary.blockers.join(" | ") || "none"}

Write:
**Verdict**
**Competitor proximity**
**Priming plan (next 7–21 days)**
**What not to spend money on**
No fake stream counts.`;
}
