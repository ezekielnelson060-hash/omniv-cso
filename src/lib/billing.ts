export type PlanId = "free" | "starter" | "pro" | "business" | "label";

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
  | "api_keys"
  | "fan_gate"
  | "audience_basic";

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
    blurb: "Publish and explore on Omniv.",
    cta: "Start free",
    features: ["Personal profile", "Entities", "Publish", "Explore"],
    limits: { zikiMessagesPerDay: 5, artists: 1, teamSeats: 1 },
  },
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 29,
    priceAnnual: 23,
    currency: "USD",
    blurb: "Mapped to Pro in discovery checkout.",
    cta: "Upgrade",
    features: ["Pro features"],
    limits: { zikiMessagesPerDay: 20, artists: 1, teamSeats: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 29,
    priceAnnual: 29,
    currency: "USD",
    blurb: "Deeper stats and verified publisher.",
    cta: "Claim Pro",
    highlighted: true,
    features: ["Analytics", "Verified entity", "Collections"],
    limits: { zikiMessagesPerDay: "unlimited", artists: 5, teamSeats: 3 },
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: 99,
    priceAnnual: 99,
    currency: "USD",
    blurb: "Teams and multi-entity verification.",
    cta: "Claim Business",
    features: ["Everything in Pro", "All entities verified", "Export"],
    limits: { zikiMessagesPerDay: "unlimited", artists: "unlimited", teamSeats: 10 },
  },
  {
    id: "label",
    name: "Label",
    priceMonthly: 99,
    priceAnnual: 99,
    currency: "USD",
    blurb: "Legacy alias of Business.",
    cta: "Claim Business",
    features: ["Business features"],
    limits: {
      zikiMessagesPerDay: "unlimited",
      artists: "unlimited",
      teamSeats: 25,
    },
  },
];

export const FEATURE_GATES: Record<FeatureId, PlanId> = {
  command_center: "free",
  opportunity_feed: "starter",
  artist_brain: "free",
  ziki_limited: "free",
  ziki_unlimited: "pro",
  analytics: "pro",
  release_simulator: "pro",
  content_intelligence: "pro",
  reports_basic: "pro",
  reports_full: "business",
  crm: "pro",
  label_dashboard: "business",
  team_seats: "pro",
  api_keys: "business",
  fan_gate: "free",
  audience_basic: "free",
};

export const PLAN_ORDER: PlanId[] = [
  "free",
  "starter",
  "pro",
  "business",
  "label",
];

export function planRank(id: PlanId): number {
  return PLAN_ORDER.indexOf(id);
}

export function hasFeature(current: PlanId, feature: FeatureId): boolean {
  const required = FEATURE_GATES[feature];
  return planRank(current) >= planRank(required);
}

export function minPlanFor(feature: FeatureId): PlanDef {
  const id = FEATURE_GATES[feature];
  return PLANS.find((p) => p.id === id)!;
}

export function planById(id: PlanId): PlanDef {
  return PLANS.find((p) => p.id === id) ?? PLANS[0]!;
}

export const FEATURE_LABELS: Record<FeatureId, string> = {
  command_center: "Command Center",
  opportunity_feed: "Opportunity Feed",
  artist_brain: "Artist Brain",
  ziki_limited: "Ziki (limited)",
  ziki_unlimited: "Unlimited Ziki",
  analytics: "Historical Analytics",
  release_simulator: "Release Simulator",
  content_intelligence: "Content Intelligence",
  reports_basic: "PDF reports",
  reports_full: "Full report suite",
  crm: "Manager CRM",
  label_dashboard: "Label Dashboard",
  team_seats: "Team seats",
  api_keys: "API keys",
  fan_gate: "Fan Gate",
  audience_basic: "Audience (basic)",
};

export const ROUTE_GATES: Record<string, FeatureId> = {
  "/opportunities": "opportunity_feed",
  "/analytics": "analytics",
  "/release-simulator": "release_simulator",
  "/content": "content_intelligence",
  "/reports": "reports_basic",
  "/crm": "audience_basic",
  "/label": "label_dashboard",
};

/** Paid access only after Flutterwave webhook confirms payment */
export const DEFAULT_PLAN: PlanId = "free";
