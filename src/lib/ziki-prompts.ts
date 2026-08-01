/**
 * Central library of Ziki context prompts.
 * Every CRM / opportunity CTA should call these so wording stays consistent
 * and the model always gets outcome-oriented structure.
 */

export type PromptCtx = {
  artistName: string;
  fanCount?: number;
  rosterCount?: number;
  openTasks?: number;
  openEvents?: number;
  superfanPct?: number;
  coldPct?: number;
  fans7d?: number;
  topSource?: string | null;
  gateSlug?: string | null;
};

function n(name?: string) {
  return name?.trim() || "this artist";
}

/** Shared closing so every prompt gets the same briefing shape */
const BRIEF =
  "Respond as an executive briefing with bold headings: **What to do**, **Why this matters for you**, **When**, **How**, **Priority**, **Expected outcome**. Be concrete — no generic advice.";

export const zikiPrompts = {
  gateBioCta(c: PromptCtx) {
    const slug = c.gateSlug ? `/f/${c.gateSlug}` : "the Omniv fan gate";
    return `Write a 3-line Instagram/TikTok bio CTA for **${n(c.artistName)}** that drives fans to ${slug}.
Include: (1) value they unlock, (2) one urgency cue, (3) plain URL instruction.
Also give one Stories script (15s) pushing the same link.
${BRIEF}`;
  },

  growOwnedList(c: PromptCtx) {
    return `Owned list size for **${n(c.artistName)}**: ${c.fanCount ?? 0} contacts${
      c.fans7d != null ? ` (+${c.fans7d} in last 7 days)` : ""
    }${c.topSource ? `; top source: ${c.topSource}` : ""}.
Give a **7-day plan** to grow the owned list using bio, Stories, and one lead magnet. Exact daily actions.
${BRIEF}`;
  },

  segmentTiers(c: PromptCtx) {
    return `**${n(c.artistName)}** has ${c.fanCount ?? 0} owned fans${
      c.superfanPct != null ? ` (~${c.superfanPct}% Superfan)` : ""
    }${c.coldPct != null ? `, ~${c.coldPct}% Cold` : ""}.
Draft: (1) a superfan-only offer, (2) a casual re-engagement message, (3) what to do with Cold.
Keep each under 80 words.
${BRIEF}`;
  },

  prioritizeTasks(c: PromptCtx) {
    return `Manager board for **${n(c.artistName)}**: ${c.openTasks ?? 0} open tasks, ${c.openEvents ?? 0} open calendar items, ${c.fanCount ?? 0} owned fans, ${c.rosterCount ?? 0} roster artists.
Pick the **top 3** moves by career impact this week. Say what to defer and why.
${BRIEF}`;
  },

  weeklyRosterReview(c: PromptCtx) {
    return `Weekly CRM review for **${n(c.artistName)}**:
- Roster artists: ${c.rosterCount ?? 0}
- Owned fans: ${c.fanCount ?? 0}${c.fans7d != null ? ` (+${c.fans7d} / 7d)` : ""}
- Open tasks: ${c.openTasks ?? 0}
- Open events: ${c.openEvents ?? 0}
${c.topSource ? `- Top acquisition source: ${c.topSource}` : ""}
What is the **single highest-impact manager move** this week? Then list 2 supporting moves.
${BRIEF}`;
  },

  gateMetricsBrief(c: PromptCtx) {
    return `Fan gate metrics for **${n(c.artistName)}**:
- Total owned: ${c.fanCount ?? 0}
- New last 7 days: ${c.fans7d ?? 0}
- Superfan share: ${c.superfanPct ?? 0}%
- Cold share: ${c.coldPct ?? 0}%
- Top source: ${c.topSource || "unknown"}
Diagnose list health and prescribe the next growth experiment (one primary).
${BRIEF}`;
  },

  opportunityAct(opts: {
    title: string;
    summary?: string;
    why?: string;
    expected?: string;
    category?: string;
    artistName?: string;
  }) {
    return `Help me execute this opportunity for **${n(opts.artistName)}**:

**${opts.title}**
${opts.summary || ""}

Why: ${opts.why || "n/a"}
Expected: ${opts.expected || "n/a"}
Category: ${opts.category || "Strategy"}

Give a concrete **7-day execution plan** with exact actions.
${BRIEF}`;
  },
};

export function zikiHref(prompt: string) {
  return `/ziki?q=${encodeURIComponent(prompt)}`;
}
