import { zikiPrompts, zikiHref, type PromptCtx } from "@/lib/ziki-prompts";

export type Priority = "P0" | "P1" | "P2";

export type ScoredStep = {
  id: string;
  priority: Priority;
  /** Higher = more urgent; used for ranking within and across bands */
  impact: number;
  title: string;
  why: string;
  when: string;
  outcome: string;
  href?: string;
  zikiPrompt?: string;
  cta?: string;
};

export type GateMetricsInput = {
  rosterCount: number;
  fanCount: number;
  fans7d: number;
  superfanCount: number;
  coldCount: number;
  topSource: string | null;
  openTasks: number;
  openEvents: number;
  gateSlug?: string | null;
  primaryArtistName?: string | null;
  placeholderName?: boolean;
};

function ctxFrom(m: GateMetricsInput): PromptCtx {
  const fanCount = m.fanCount || 1;
  return {
    artistName: m.primaryArtistName || "this artist",
    fanCount: m.fanCount,
    rosterCount: m.rosterCount,
    openTasks: m.openTasks,
    openEvents: m.openEvents,
    superfanPct: Math.round((m.superfanCount / fanCount) * 100),
    coldPct: Math.round((m.coldCount / fanCount) * 100),
    fans7d: m.fans7d,
    topSource: m.topSource,
    gateSlug: m.gateSlug,
  };
}

/**
 * Score-ranked next steps. Impact is additive so multiple weak signals
 * don't outrank a single P0 blocker.
 */
export function buildScoredSteps(m: GateMetricsInput): ScoredStep[] {
  const steps: ScoredStep[] = [];
  const name = m.primaryArtistName || "this artist";
  const c = ctxFrom(m);
  const superfanPct =
    m.fanCount > 0 ? Math.round((m.superfanCount / m.fanCount) * 100) : 0;
  const coldPct =
    m.fanCount > 0 ? Math.round((m.coldCount / m.fanCount) * 100) : 0;

  // P0 — blockers
  if (m.placeholderName) {
    steps.push({
      id: "rename-roster",
      priority: "P0",
      impact: 100,
      title: "Replace placeholder roster name",
      why: "Gate and CRM still show test copy. Fans and managers should see the real stage name.",
      when: "Today",
      outcome: "Public gate branded correctly",
      href: "#strategy-roster",
      cta: "Fix identity",
    });
  }

  if (m.rosterCount === 0) {
    steps.push({
      id: "seed-roster",
      priority: "P0",
      impact: 95,
      title: "Seed your first roster artist",
      why: "Fan capture needs a roster_artists row. No row → gate cannot save contacts.",
      when: "Today",
      outcome: "Gate URL + isolated fan list",
      href: "#strategy-roster",
      cta: "Add artist",
    });
  }

  if (m.rosterCount > 0 && m.fanCount === 0) {
    steps.push({
      id: "share-gate",
      priority: "P0",
      impact: 90,
      title: `Share the fan gate for ${name}`,
      why: "Zero owned contacts means zero owned distribution. Bio link is the fastest start.",
      when: "This week",
      outcome: "First 25–50 consented emails",
      href: m.gateSlug ? `/f/${m.gateSlug}` : undefined,
      zikiPrompt: zikiPrompts.gateBioCta(c),
      cta: m.gateSlug ? "Open gate" : "Set slug",
    });
  }

  // P1 — growth & systems
  if (m.fanCount > 0 && m.fanCount < 50) {
    steps.push({
      id: "grow-list-early",
      priority: "P1",
      impact: 70 + Math.min(20, m.fans7d),
      title: "Push past 50 owned fans",
      why: "Under 50, segmentation is noise. Hit a minimum viable owned list first.",
      when: "Next 14 days",
      outcome: "List large enough for first campaign test",
      zikiPrompt: zikiPrompts.growOwnedList(c),
      cta: "Plan with Ziki",
    });
  } else if (m.fanCount >= 50 && m.fanCount < 200) {
    steps.push({
      id: "grow-list-mid",
      priority: "P1",
      impact: 60 + Math.min(15, m.fans7d),
      title: "Scale owned list toward 200",
      why: "Mid-size lists unlock city clusters and repeat campaign lifts.",
      when: "Next 30 days",
      outcome: "Tour / drop testing sample",
      zikiPrompt: zikiPrompts.growOwnedList(c),
      cta: "Growth plan",
    });
  }

  if (m.fanCount >= 30 && superfanPct < 8) {
    steps.push({
      id: "lift-superfans",
      priority: "P1",
      impact: 65,
      title: "Raise Superfan share above 8%",
      why: `Only ~${superfanPct}% are Superfans. High-intent fans fund merch, VIP, and lookalikes.`,
      when: "This month",
      outcome: "Healthier monetizable core",
      zikiPrompt: zikiPrompts.segmentTiers(c),
      cta: "Tier playbook",
    });
  }

  if (m.fanCount >= 40 && coldPct > 40) {
    steps.push({
      id: "clean-cold",
      priority: "P1",
      impact: 55,
      title: "Re-engage or prune Cold fans",
      why: `~${coldPct}% of the list is Cold. Dead weight hurts deliverability and clarity.`,
      when: "This week",
      outcome: "Cleaner list + one win-back test",
      zikiPrompt: zikiPrompts.segmentTiers(c),
      cta: "Cold plan",
    });
  }

  if (m.fanCount >= 100 && superfanPct >= 8) {
    steps.push({
      id: "segment-act",
      priority: "P1",
      impact: 58,
      title: "Run tiered Superfan vs Casual messages",
      why: "List is large enough and healthy enough for differentiated offers.",
      when: "This week",
      outcome: "Two tailored messages ready to send",
      zikiPrompt: zikiPrompts.segmentTiers(c),
      cta: "Brief Ziki",
    });
  }

  if (m.fans7d === 0 && m.fanCount > 0 && m.rosterCount > 0) {
    steps.push({
      id: "stalled-growth",
      priority: "P1",
      impact: 72,
      title: "Restart gate traffic — 0 new fans in 7 days",
      why: "List growth stalled. Usually bio link missing, creative fatigue, or no lead magnet.",
      when: "Today",
      outcome: "Fresh acquisition test live",
      zikiPrompt: zikiPrompts.gateMetricsBrief(c),
      href: m.gateSlug ? `/f/${m.gateSlug}` : undefined,
      cta: "Diagnose",
    });
  }

  if (m.openTasks === 0) {
    steps.push({
      id: "task-system",
      priority: "P1",
      impact: 48,
      title: "Log this week’s three roster tasks",
      why: "Priorities in chat get lost. Tasks create a single execution board.",
      when: "Today",
      outcome: "Visible weekly board",
      href: "#crm-tasks",
      cta: "Add tasks",
    });
  } else if (m.openTasks > 5) {
    steps.push({
      id: "task-trim",
      priority: "P1",
      impact: 52,
      title: `Cut open tasks from ${m.openTasks} to top 3`,
      why: "Too many open items hides the highest-impact move.",
      when: "Today",
      outcome: "Clear P0/P1 board",
      zikiPrompt: zikiPrompts.prioritizeTasks(c),
      cta: "Prioritize",
    });
  }

  // P2 — hygiene
  if (m.openEvents === 0) {
    steps.push({
      id: "calendar",
      priority: "P2",
      impact: 30,
      title: "Put release or content dates on the calendar",
      why: "Without dates, strategy stays abstract.",
      when: "This week",
      outcome: "Shared timeline",
      href: "#crm-calendar",
      cta: "Add event",
    });
  }

  steps.push({
    id: "ziki-roster",
    priority: "P2",
    impact: 25,
    title: "Weekly Ziki roster review",
    why: "One briefing aligns multi-artist managers on the single highest-impact move.",
    when: "Every Monday",
    outcome: "Executive clarity",
    zikiPrompt: zikiPrompts.weeklyRosterReview(c),
    cta: "Ask Ziki",
  });

  const band = { P0: 0, P1: 1, P2: 2 };
  return steps
    .sort((a, b) => {
      if (band[a.priority] !== band[b.priority])
        return band[a.priority] - band[b.priority];
      return b.impact - a.impact;
    })
    .slice(0, 4)
    .map((s) => ({
      ...s,
      // ensure ziki links use shared helper when prompt present
      ...(s.zikiPrompt ? { href: s.href || zikiHref(s.zikiPrompt) } : {}),
    }));
}

export function isPlaceholderStageName(name: string | null | undefined) {
  if (!name) return false;
  const n = name.toLowerCase();
  return (
    n.includes("your real") ||
    n.includes("placeholder") ||
    n.includes("legacy build") ||
    n === "artist" ||
    n.includes("test artist")
  );
}
