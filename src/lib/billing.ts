export type PlanId = "free" | "starter" | "pro" | "label";

export type FeatureId =
  | "command_center"
  | "opportunity_feed"
  | "artist_brain"
  | "ziki_limited"
  | "ziki_unlimited"
  | "analytics"
  | "release_simulator"
  | "content_intelligence"
  | "reports_basic"
  | "reports_full"
  | "crm"
  | "label_dashboard"
  | "team_seats"
  | "api_keys";

export interface PlanDef {
  id: PlanId;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  blurb: string;
  cta: string;
  highlighted?: boolean;
  features: string[];
  limits: {
    zikiMessagesPerDay: number | "unlimited";
    artists: number | "unlimited";
    teamSeats: number;
  };
}

export const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceAnnual: 0,
    currency: "USD",
    blurb: "Taste the system — limited Ziki, one workspace",
    cta: "Enter free",
    features: [
      "Command Center",
      "Artist Brain",
      "5 Ziki messages / day",
      "1 artist workspace",
    ],
    limits: { zikiMessagesPerDay: 5, artists: 1, teamSeats: 1 },
  },
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 29,
    priceAnnual: 23,
    currency: "USD",
    blurb: "Solo operators — full feed, deeper Ziki, analytics",
    cta: "Claim Starter",
    features: [
      "Everything in Free",
      "Full Opportunity Feed",
      "Historical Analytics",
      "50 Ziki messages / day",
      "Surface scan",
    ],
    limits: { zikiMessagesPerDay: 50, artists: 1, teamSeats: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 79,
    priceAnnual: 63,
    currency: "USD",
    blurb: "Lean managers — roster clarity, simulator, unlimited Ziki",
    cta: "Claim Pro",
    highlighted: true,
    features: [
      "Everything in Starter",
      "Release Simulator",
      "CRM & fan directory",
      "Unlimited Ziki",
      "Team seats",
      "Up to 20 artists",
    ],
    limits: { zikiMessagesPerDay: "unlimited", artists: 20, teamSeats: 5 },
  },
  {
    id: "label",
    name: "Label",
    priceMonthly: 199,
    priceAnnual: 159,
    currency: "USD",
    blurb: "Label OS — roster priority, reports, API",
    cta: "Claim Label",
    features: [
      "Everything in Pro",
      "Label dashboard",
      "Full reports",
      "API keys",
      "Higher roster limits",
    ],
    limits: { zikiMessagesPerDay: "unlimited", artists: 50, teamSeats: 15 },
  },
];

export const FEATURE_LABELS: Record<FeatureId, string> = {
  command_center: "Command Center",
  opportunity_feed: "Opportunity Feed",
  artist_brain: "Artist Brain",
  ziki_limited: "Ziki (limited)",
  ziki_unlimited: "Ziki (unlimited)",
  analytics: "Analytics",
  release_simulator: "Release Simulator",
  content_intelligence: "Content Intelligence",
  reports_basic: "Reports",
  reports_full: "Full Reports",
  crm: "CRM",
  label_dashboard: "Label Dashboard",
  team_seats: "Team seats",
  api_keys: "API keys",
};

const PLAN_ORDER: PlanId[] = ["free", "starter", "pro", "label"];

export function planIndex(id: PlanId): number {
  return PLAN_ORDER.indexOf(id);
}

export function hasFeature(plan: PlanId, feature: FeatureId): boolean {
  const map: Record<PlanId, FeatureId[]> = {
    free: ["command_center", "artist_brain", "ziki_limited"],
    starter: [
      "command_center",
      "artist_brain",
      "ziki_limited",
      "opportunity_feed",
      "analytics",
      "reports_basic",
    ],
    pro: [
      "command_center",
      "artist_brain",
      "ziki_limited",
      "ziki_unlimited",
      "opportunity_feed",
      "analytics",
      "release_simulator",
      "content_intelligence",
      "reports_basic",
      "reports_full",
      "crm",
      "team_seats",
    ],
    label: [
      "command_center",
      "artist_brain",
      "ziki_limited",
      "ziki_unlimited",
      "opportunity_feed",
      "analytics",
      "release_simulator",
      "content_intelligence",
      "reports_basic",
      "reports_full",
      "crm",
      "label_dashboard",
      "team_seats",
      "api_keys",
    ],
  };
  return map[plan]?.includes(feature) ?? false;
}

export function minPlanFor(feature: FeatureId): PlanDef {
  for (const id of PLAN_ORDER) {
    if (hasFeature(id, feature)) {
      return PLANS.find((p) => p.id === id)!;
    }
  }
  return PLANS[PLANS.length - 1]!;
}
