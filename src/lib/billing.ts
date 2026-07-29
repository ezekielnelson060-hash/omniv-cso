/**
 * Plan matrix, feature gates, and Flutterwave-aware billing helpers.
 * Payment provider remains Flutterwave (do not swap for Stripe).
 */

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
    blurb: "See the product. One scorecard, limited Ziki.",
    cta: "Start free",
    features: [
      "Command Center (basic scores)",
      "Artist Brain (view/edit)",
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
    blurb: "Solo artists running a weekly strategy cadence",
    cta: "Upgrade to Starter",
    features: [
      "Everything in Free",
      "Full Opportunity Feed",
      "Historical Analytics",
      "50 Ziki messages / day",
      "1 artist",
    ],
    limits: { zikiMessagesPerDay: 50, artists: 1, teamSeats: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 59,
    priceAnnual: 47,
    currency: "USD",
    blurb: "Artists & managers shipping releases with AI",
    cta: "Upgrade to Pro",
    highlighted: true,
    features: [
      "Everything in Starter",
      "Release Simulator",
      "Content Intelligence",
      "PDF reports (artist + campaign)",
      "Manager CRM (up to 5 artists)",
      "Unlimited Ziki",
    ],
    limits: { zikiMessagesPerDay: "unlimited", artists: 5, teamSeats: 3 },
  },
  {
    id: "label",
    name: "Label",
    priceMonthly: 179,
    priceAnnual: 143,
    currency: "USD",
    blurb: "Labels & multi-manager teams",
    cta: "Upgrade to Label",
    features: [
      "Everything in Pro",
      "Label Dashboard",
      "Unlimited roster",
      "Full report suite + investor",
      "API keys",
      "Priority support",
    ],
    limits: { zikiMessagesPerDay: "unlimited", artists: "unlimited", teamSeats: 25 },
  },
];

export const FEATURE_GATES: Record<FeatureId, PlanId> = {
  command_center: "free",
  opportunity_feed: "starter",
  artist_brain: "free",
  ziki_limited: "free",
  ziki_unlimited: "pro",
  analytics: "starter",
  release_simulator: "pro",
  content_intelligence: "pro",
  reports_basic: "pro",
  reports_full: "label",
  crm: "pro",
  label_dashboard: "label",
  team_seats: "pro",
  api_keys: "label",
};

export const PLAN_ORDER: PlanId[] = ["free", "starter", "pro", "label"];

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
};

export const ROUTE_GATES: Record<string, FeatureId> = {
  "/opportunities": "opportunity_feed",
  "/analytics": "analytics",
  "/release-simulator": "release_simulator",
  "/content": "content_intelligence",
  "/reports": "reports_basic",
  "/crm": "crm",
  "/label": "label_dashboard",
};

export const DEFAULT_PLAN: PlanId = "starter";
