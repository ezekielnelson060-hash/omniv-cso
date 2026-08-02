/**
 * Algorithmic playlist placement + TikTok viral mechanics
 * Heuristic models for indie release strategy (not platform APIs).
 */

import type { ArtistBrain } from "@/types";
import type { ReleaseWindowInput, WindowScore } from "@/lib/strategy/release-simulator";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export type PlaylistSignal = {
  score: number;
  tierFocus: "algorithmic" | "independent" | "editorial_longshot";
  levers: string[];
  avoid: string[];
  path: string[];
};

export type TikTokSignal = {
  score: number;
  viralReadiness: number;
  mechanics: string[];
  testPlan: string[];
  killCriteria: string[];
};

/**
 * Algorithmic playlists (e.g. Discover Weekly / Radio / auto mixes) respond to:
 * - Early save rate and completion more than raw plays
 * - Consistency of listener cohort (not one viral spike only)
 * - Skip rate in first 30s
 * - Playlist-to-catalogue follow-through
 * Independents rarely "pitch" algo lists directly — they engineer signals.
 */
export function algorithmicPlaylistPlacement(
  input: ReleaseWindowInput,
  window: WindowScore,
  brain: ArtistBrain | null
): PlaylistSignal {
  let score = 35;
  const levers: string[] = [];
  const avoid: string[] = [];
  const path: string[] = [];

  if (input.platforms.includes("spotify") || input.platforms.includes("apple")) {
    score += 12;
    levers.push("Streaming profile linked — algo systems can attribute listens.");
  } else {
    avoid.push("No streaming surface selected — algorithmic placement has nowhere to land.");
    score -= 15;
  }

  if (input.playlistPitchReady) {
    score += 10;
    levers.push("Indie curator list ready — human lists still seed algo training data.");
    path.push("Pitch 8–12 niche independents in the first 5 days (not major editorial only).");
  } else {
    path.push("Build a niche curator list — algo lift often follows early playlist density.");
  }

  if (input.ownedListReady) {
    score += 14;
    levers.push("Owned fans can drive first-week saves — the strongest algo signal you control.");
    path.push("Day 0–2: push owned list for listens + saves, not vanity share spam.");
  } else {
    avoid.push("Without an owned list, first-week save rate is mostly luck.");
    score -= 10;
  }

  if (window.priming >= 55) {
    score += 10;
    levers.push("Priming raises likelihood of concentrated early engagement.");
  }

  if (window.competition < 40) {
    score -= 8;
    avoid.push("Crowded window dilutes the first-week signal algos need.");
  }

  const stage = brain?.careerStage || "emerging";
  if (stage === "emerging" || stage === "developing") {
    path.push(
      "Focus algorithmic + independent lists first; major editorial is a longshot until signals exist."
    );
  } else {
    path.push("Layer indie lists + soft editorial outreach after 7-day save/completion data.");
    score += 6;
  }

  path.push(
    "Optimise for completion and saves in the first 30s — skip-heavy intros kill algo candidates."
  );
  path.push(
    "Do not buy fake streams; algos detect inorganic patterns and suppress."
  );
  levers.push(
    "Algo path: early save rate → radio/auto-mix candidacy → broader Discover-style surfaces."
  );

  const tierFocus: PlaylistSignal["tierFocus"] =
    score >= 60 ? "algorithmic" : input.playlistPitchReady ? "independent" : "editorial_longshot";

  return {
    score: clamp(score),
    tierFocus,
    levers: levers.slice(0, 5),
    avoid: avoid.slice(0, 4),
    path: path.slice(0, 6),
  };
}

/**
 * TikTok viral mechanics (simplified product model):
 * - Hook in <1.5s (pattern interrupt)
 * - Loopability (natural rewatch)
 * - Native sound usage / original sound ownership
 * - Series / duet / stitch affordances
 * - Posting velocity during test window
 * - Not the same as "post the chorus once"
 */
export function tiktokViralMechanics(
  input: ReleaseWindowInput,
  window: WindowScore
): TikTokSignal {
  let score = 30;
  const mechanics: string[] = [];
  const testPlan: string[] = [];
  const killCriteria: string[] = [];

  const hasTT =
    input.platforms.includes("tiktok") ||
    input.platforms.includes("instagram"); // Reels shares similar dynamics

  if (input.platforms.includes("tiktok")) {
    score += 18;
    mechanics.push("TikTok selected — treat sound ownership as a product, not a one-off post.");
  } else if (input.platforms.includes("instagram")) {
    score += 10;
    mechanics.push("Reels can seed awareness; TikTok still wins pure sound discovery for many lanes.");
  } else {
    score -= 12;
    mechanics.push("No short-form surface — viral sound mechanics are mostly unavailable.");
  }

  if (input.contentReady) {
    score += 16;
    mechanics.push("Content pack ready enables multi-hook testing (required for virality odds).");
  } else {
    score -= 12;
    mechanics.push("Without a pack, you cannot run the test → kill → double-down loop.");
  }

  if (window.priming >= 50) {
    score += 12;
  }

  if (window.positioning >= 55) {
    score += 8;
    mechanics.push("Clear positioning helps hooks feel intentional, not random clips.");
  }

  // Core mechanics education
  mechanics.push("Hook &lt;1.5s: face, text, or pattern interrupt before the title card.");
  mechanics.push("Loop: end frame should reconnect to start — rewatches train the algo.");
  mechanics.push("Original sound: post from the sound page once a cut works; invite stitches.");

  if (hasTT && input.contentReady) {
    testPlan.push("Day 1–2: 3 hook variants of the same 8–12s moment; identical caption style.");
    testPlan.push("Day 3: kill bottom 2 by completion rate; shoot 2 new angles of the winner.");
    testPlan.push("Day 4–5: series format (part 1 / part 2) on the winning hook.");
    testPlan.push("Drop week: native sound posts daily, not one premiere dump.");
  } else {
    testPlan.push("Unlock TikTok/Reels + content pack before running viral tests.");
  }

  killCriteria.push("Kill a cut if completion &lt; peer average after 200–400 views.");
  killCriteria.push("Stop boosting if hold-rate collapses in first 1s after a paid spike.");
  killCriteria.push("Do not chase unrelated trends that break positioning.");

  return {
    score: clamp(score),
    viralReadiness: clamp(score * 0.9 + (window.priming > 60 ? 8 : 0)),
    mechanics: mechanics.slice(0, 6),
    testPlan: testPlan.slice(0, 5),
    killCriteria: killCriteria.slice(0, 4),
  };
}

export type DecisionNode = {
  id: string;
  label: string;
  status: "pass" | "fail" | "warn" | "info";
  detail?: string;
  children?: DecisionNode[];
};

/** Visual decision tree for Go / Caution / Hold */
export function buildVerdictTree(window: WindowScore): DecisionNode {
  const lethal = window.proximityHits.some(
    (h) =>
      h.band === "same_day" &&
      h.sameLane &&
      (h.scale === "larger" || h.scale === "peer")
  );

  const gate = (
    ok: boolean,
    warn: boolean,
    label: string,
    detail: string
  ): DecisionNode => ({
    id: label,
    label,
    status: ok ? "pass" : warn ? "warn" : "fail",
    detail,
  });

  return {
    id: "root",
    label: `Verdict path → ${window.verdict}`,
    status:
      window.verdict === "Go"
        ? "pass"
        : window.verdict === "Hold"
          ? "fail"
          : "warn",
    detail: `Overall ${window.overall}/100`,
    children: [
      {
        id: "hard",
        label: "Hard gates",
        status: lethal || window.blockers.length >= 3 || window.readiness < 40 ? "fail" : "pass",
        children: [
          gate(
            !lethal,
            false,
            "No lethal competitor conflict",
            lethal
              ? "Same-day same-lane peer/larger act"
              : "No same-day same-lane peer/larger hit"
          ),
          gate(
            window.blockers.length < 3,
            window.blockers.length === 2,
            `Blockers (${window.blockers.length})`,
            window.blockers[0] || "None"
          ),
          gate(
            window.readiness >= 40,
            window.readiness >= 35,
            `Readiness ${window.readiness}`,
            "Must be ≥ 40 to avoid Hold"
          ),
          gate(
            window.competition >= 35,
            window.competition >= 30,
            `Competition ${window.competition}`,
            "Must be ≥ 35 to avoid Hold"
          ),
        ],
      },
      {
        id: "soft",
        label: "Go gates (all required)",
        status:
          window.verdict === "Go"
            ? "pass"
            : window.verdict === "Caution"
              ? "warn"
              : "fail",
        children: [
          gate(window.overall >= 76, window.overall >= 65, `Overall ≥ 76 (${window.overall})`, ""),
          gate(window.readiness >= 58, window.readiness >= 50, `Readiness ≥ 58 (${window.readiness})`, ""),
          gate(window.timing >= 55, window.timing >= 45, `Timing ≥ 55 (${window.timing})`, ""),
          gate(
            window.competition >= 50,
            window.competition >= 40,
            `Competition ≥ 50 (${window.competition})`,
            ""
          ),
          gate(window.priming >= 50, window.priming >= 40, `Priming ≥ 50 (${window.priming})`, ""),
          gate(window.blockers.length <= 1, window.blockers.length <= 2, "≤ 1 blocker", ""),
        ],
      },
      {
        id: "action",
        label:
          window.verdict === "Go"
            ? "Action: execute priming + light optional paid"
            : window.verdict === "Hold"
              ? "Action: do not spend — fix gates first"
              : "Action: thin plan, cap paid until 72h signal",
        status:
          window.verdict === "Go"
            ? "pass"
            : window.verdict === "Hold"
              ? "fail"
              : "warn",
      },
    ],
  };
}
