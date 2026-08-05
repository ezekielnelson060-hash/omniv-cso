/**
 * Distribution signals: algorithmic lists, Spotify editorial, Apple Music radio, TikTok.
 * Heuristic strategy models, not live platform APIs.
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

export type EditorialSignal = {
  score: number;
  likelihood: "low" | "medium" | "stretch";
  whatEditorsWeigh: string[];
  submitPath: string[];
  realism: string;
};

export type AppleRadioSignal = {
  score: number;
  levers: string[];
  path: string[];
  note: string;
};

export type TikTokSignal = {
  score: number;
  viralReadiness: number;
  mechanics: string[];
  testPlan: string[];
  killCriteria: string[];
};

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
    levers.push("Streaming profile linked. Algo systems can attribute listens.");
  } else {
    avoid.push("No streaming surface selected. Algorithmic placement has nowhere to land.");
    score -= 15;
  }

  if (input.playlistPitchReady) {
    score += 10;
    levers.push("Indie curator list ready. Human lists still seed algo training data.");
    path.push("Pitch 8–12 niche independents in the first 5 days (not major editorial only).");
  } else {
    path.push("Build a niche curator list. Algo lift often follows early playlist density.");
  }

  if (input.ownedListReady) {
    score += 14;
    levers.push("Owned fans can drive first-week saves: the strongest algo signal you control.");
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
    "Optimise for completion and saves in the first 30s. Skip-heavy intros kill algo candidates."
  );
  path.push("Do not buy fake streams; algos detect inorganic patterns and suppress.");
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
 * Spotify editorial curation (human + data-assisted):
 * - Pitch via Spotify for Artists (typically ~7 days before release)
 * - Editors weigh: story, timing, prior performance, market fit, audio quality, uniqueness
 * - Not a lottery ticket for cold artists. Signals + narrative matter
 * - Regional editorial and genre desks differ; global flagship lists are rare first hits
 */
export function spotifyEditorialCuration(
  input: ReleaseWindowInput,
  window: WindowScore,
  brain: ArtistBrain | null
): EditorialSignal {
  let score = 22;
  const whatEditorsWeigh: string[] = [
    "Clear story / why this release matters now",
    "Fit to playlist mood & lane (not just genre tag)",
    "Recent performance (saves, skip rate, prior list history)",
    "Release hygiene: cover, metadata, canvas, timing",
    "Market focus (city/country desks often move first)",
  ];
  const submitPath: string[] = [];

  if (!input.platforms.includes("spotify")) {
    return {
      score: 10,
      likelihood: "low",
      whatEditorsWeigh,
      submitPath: ["Add Spotify as a surface before treating editorial as a lever."],
      realism:
        "Editorial is not available as a path until the track lives on Spotify with a complete profile.",
    };
  }

  score += 8;

  if (input.playlistPitchReady) {
    score += 12;
    submitPath.push("Submit in Spotify for Artists ≥7 days before release with a tight pitch paragraph.");
  } else {
    submitPath.push("Prepare S4A pitch: 1–2 sentences on sound + 1 sentence on why now.");
  }

  if (window.positioning >= 55) {
    score += 12;
    submitPath.push("Reuse your positioning line in the pitch. Editors skim.");
  } else {
    score -= 8;
    submitPath.push("Sharpen positioning before any editorial submit.");
  }

  if (window.priming >= 50 && input.ownedListReady) {
    score += 10;
  }

  const stage = brain?.careerStage || "emerging";
  if (stage === "emerging") {
    score -= 5;
    submitPath.push(
      "Emerging: prioritise regional/genre micro-lists and independents before flagship editorial."
    );
  } else if (stage === "breakthrough" || stage === "established") {
    score += 12;
    submitPath.push("Use prior list history and press in the pitch; ask for the specific list mood.");
  }

  if (window.competition < 40) {
    score -= 6;
    submitPath.push("Crowded week: editors have more same-lane options. Differentiation is mandatory.");
  }

  submitPath.push(
    "Do not pitch every list; 3–5 realistic targets beat 30 spray-and-pray submissions."
  );
  submitPath.push(
    "After release: let first-week save data work. Follow-up only if you have a real update (remix, video, tour)."
  );

  const likelihood: EditorialSignal["likelihood"] =
    score >= 55 ? "medium" : score >= 35 ? "stretch" : "low";

  const realism =
    likelihood === "low"
      ? "Treat major editorial as a stretch goal. Win independents + algo signals first."
      : likelihood === "stretch"
        ? "Possible for niche/regional desks if the story is sharp; flagship lists remain unlikely."
        : "Credible path for targeted editorial if pitch + first-week signals align.";

  return {
    score: clamp(score),
    likelihood,
    whatEditorsWeigh,
    submitPath: submitPath.slice(0, 6),
    realism,
  };
}

/**
 * Apple Music algorithmic radio / auto stations:
 * - Driven by listens, likes (favorite), adds to library, completion, skips
 * - Station seed from a song/artist expands via taste graph
 * - Editorial (Apple Music playlists) is separate from radio, still human-led for many flagships
 * - Strong library-add rate helps more than raw play spam
 */
export function appleMusicAlgorithmicRadio(
  input: ReleaseWindowInput,
  window: WindowScore
): AppleRadioSignal {
  let score = 28;
  const levers: string[] = [];
  const path: string[] = [];

  if (!input.platforms.includes("apple") && !input.platforms.includes("spotify")) {
    return {
      score: 12,
      levers: ["No Apple/streaming surface. Radio systems cannot train on your catalogue."],
      path: ["Distribute to Apple Music and complete artist metadata before optimising for radio."],
      note: "Apple Music radio/stations personalise from library and listening behaviour, not cold outreach.",
    };
  }

  if (input.platforms.includes("apple")) {
    score += 16;
    levers.push("Apple Music surface on. Stations can seed from your tracks.");
  } else {
    score += 4;
    levers.push("Spotify selected but not Apple. Dual-DSP still recommended for radio reach.");
    path.push("Add Apple Music distribution for station and library-add loops.");
  }

  if (input.ownedListReady) {
    score += 14;
    levers.push("Owned fans can drive library adds: a key radio/station signal.");
    path.push("CTA: ‘Add to library’ / love track, not only ‘stream once’.");
  } else {
    score -= 8;
    path.push("Stand up fan gate so early listeners can be asked to library-add.");
  }

  if (window.priming >= 50) {
    score += 10;
    levers.push("Priming concentrates early behaviour that stations amplify.");
  }

  if (window.readiness >= 55) {
    score += 8;
  }

  levers.push("Completion + low skip in the first 30s improves station continuation.");
  levers.push("Favorites/library adds outweigh anonymous background plays.");

  path.push("Week 1: ask existing fans for library add + complete listens on the lead track.");
  path.push("Avoid playlist-milking bots; Apple taste graphs punish inorganic clusters.");
  path.push("Use song radio only after you have a clean seed track with solid early engagement.");

  return {
    score: clamp(score),
    levers: levers.slice(0, 5),
    path: path.slice(0, 5),
    note: "Apple Music algorithmic radio ≠ Apple editorial playlists. Optimise library adds for radio; pitch separately for human lists.",
  };
}

export function tiktokViralMechanics(
  input: ReleaseWindowInput,
  window: WindowScore
): TikTokSignal {
  let score = 30;
  const mechanics: string[] = [];
  const testPlan: string[] = [];
  const killCriteria: string[] = [];

  const hasTT =
    input.platforms.includes("tiktok") || input.platforms.includes("instagram");

  if (input.platforms.includes("tiktok")) {
    score += 18;
    mechanics.push("TikTok selected. Treat sound ownership as a product, not a one-off post.");
  } else if (input.platforms.includes("instagram")) {
    score += 10;
    mechanics.push("Reels can seed awareness; TikTok still wins pure sound discovery for many lanes.");
  } else {
    score -= 12;
    mechanics.push("No short-form surface. Viral sound mechanics are mostly unavailable.");
  }

  if (input.contentReady) {
    score += 16;
    mechanics.push("Content pack ready enables multi-hook testing (required for virality odds).");
  } else {
    score -= 12;
    mechanics.push("Without a pack, you cannot run the test → kill → double-down loop.");
  }

  if (window.priming >= 50) score += 12;
  if (window.positioning >= 55) {
    score += 8;
    mechanics.push("Clear positioning helps hooks feel intentional, not random clips.");
  }

  mechanics.push("Hook <1.5s: face, text, or pattern interrupt before the title card.");
  mechanics.push("Loop: end frame should reconnect to start. Rewatches train the algo.");
  mechanics.push("Original sound: post from the sound page once a cut works; invite stitches.");

  if (hasTT && input.contentReady) {
    testPlan.push("Day 1–2: 3 hook variants of the same 8–12s moment; identical caption style.");
    testPlan.push("Day 3: kill bottom 2 by completion rate; shoot 2 new angles of the winner.");
    testPlan.push("Day 4–5: series format (part 1 / part 2) on the winning hook.");
    testPlan.push("Drop week: native sound posts daily, not one premiere dump.");
  } else {
    testPlan.push("Unlock TikTok/Reels + content pack before running viral tests.");
  }

  killCriteria.push("Kill a cut if completion < peer average after 200–400 views.");
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
  emoji?: string;
  children?: DecisionNode[];
};

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
    detail: string,
    emoji: string
  ): DecisionNode => ({
    id: label,
    label,
    emoji,
    status: ok ? "pass" : warn ? "warn" : "fail",
    detail,
  });

  const verdictEmoji =
    window.verdict === "Go" ? "🟢" : window.verdict === "Hold" ? "🔴" : "🟡";

  return {
    id: "root",
    label: `Verdict path → ${window.verdict}`,
    emoji: verdictEmoji,
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
        emoji: "🚧",
        status:
          lethal || window.blockers.length >= 3 || window.readiness < 40
            ? "fail"
            : "pass",
        children: [
          gate(
            !lethal,
            false,
            "No lethal competitor conflict",
            lethal
              ? "Same-day same-lane peer/larger act"
              : "No same-day same-lane peer/larger hit",
            "⚔️"
          ),
          gate(
            window.blockers.length < 3,
            window.blockers.length === 2,
            `Blockers (${window.blockers.length})`,
            window.blockers[0] || "None",
            "🧱"
          ),
          gate(
            window.readiness >= 40,
            window.readiness >= 35,
            `Readiness ${window.readiness}`,
            "Must be ≥ 40 to avoid Hold",
            "📦"
          ),
          gate(
            window.competition >= 35,
            window.competition >= 30,
            `Competition ${window.competition}`,
            "Must be ≥ 35 to avoid Hold",
            "📅"
          ),
        ],
      },
      {
        id: "soft",
        label: "Go gates (all required)",
        emoji: "🎯",
        status:
          window.verdict === "Go"
            ? "pass"
            : window.verdict === "Caution"
              ? "warn"
              : "fail",
        children: [
          gate(
            window.overall >= 76,
            window.overall >= 65,
            `Overall ≥ 76 (${window.overall})`,
            "",
            "📊"
          ),
          gate(
            window.readiness >= 58,
            window.readiness >= 50,
            `Readiness ≥ 58 (${window.readiness})`,
            "",
            "✅"
          ),
          gate(
            window.timing >= 55,
            window.timing >= 45,
            `Timing ≥ 55 (${window.timing})`,
            "",
            "⏱️"
          ),
          gate(
            window.competition >= 50,
            window.competition >= 40,
            `Competition ≥ 50 (${window.competition})`,
            "",
            "🏁"
          ),
          gate(
            window.priming >= 50,
            window.priming >= 40,
            `Priming ≥ 50 (${window.priming})`,
            "",
            "🔥"
          ),
          gate(
            window.blockers.length <= 1,
            window.blockers.length <= 2,
            "≤ 1 blocker",
            "",
            "🧹"
          ),
        ],
      },
      {
        id: "action",
        emoji:
          window.verdict === "Go"
            ? "🚀"
            : window.verdict === "Hold"
              ? "🛑"
              : "⚠️",
        label:
          window.verdict === "Go"
            ? "Action: execute priming + light optional paid"
            : window.verdict === "Hold"
              ? "Action: do not spend. Fix gates first"
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
