import type { PlanId, FeatureId } from "@/types";

export type { PlanId, FeatureId };

export type PlanDef = {
  id: PlanId;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  currency: string;
  blurb: string;
  cta: string;
  features: string[];
  limits: {
    zikiMessagesPerDay: number | "unlimited";
    artists: number | "unlimited";
    teamSeats: number;
  };
  highlighted?: boolean;
};

export const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceAnnual: 0,
    currency: "USD",
    blurb: "Taste the system — 5 Ziki messages/month. Hit the wall, upgrade.",
    cta: "Enter free",
    features: [
      "Command Center",
      "Artist Brain",
      "5 Ziki messages / month",
      "Fan Gate + fan list",
      "Rooms, tips & tickets",
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
    blurb: "20 Ziki/day + full opportunity feed. Step up when Free runs out.",
    cta: "Claim Starter",
    features: [
      "Everything in Free",
      "Full Opportunity Feed",
      "Historical Analytics",
      "20 Ziki messages / day",
      "Surface scan",
      "City map + invite",
    ],
    limits: { zikiMessagesPerDay: 20, artists: 1, teamSeats: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 59,
    priceAnnual: 47,
    currency: "USD",
    blurb: "Unlimited Ziki. Ranked moves, pitches, rooms — no message ceiling.",
    cta: "Claim Pro",
    highlighted: true,
    features: [
      "Everything in Starter",
      "Release Simulator (uploads)",
      "Content Intelligence",
      "Manager CRM",
      "PDF reports",
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
    blurb: "Label OS. Roster priority, reports, API",
    cta: "Claim Label",
    features: [
      "Everything in Pro",
      "Label Dashboard",
      "Unlimited roster",
      "Full reports + investor",
      "API keys",
    ],
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
  historical_analytics: "starter",
  release_simulator: "pro",
  content_intelligence: "pro",
  manager_crm: "pro",
  label_dashboard: "label",
  reports: "pro",
  api_keys: "label",
};

export function planById(id: PlanId | string): PlanDef {
  return PLANS.find((p) => p.id === id) || PLANS[0]!;
}

export function planRank(id: PlanId | string): number {
  const order: PlanId[] = ["free", "starter", "pro", "label"];
  const i = order.indexOf(id as PlanId);
  return i >= 0 ? i : 0;
}

export function canAccessFeature(
  plan: PlanId | string,
  feature: FeatureId
): boolean {
  const required = FEATURE_GATES[feature];
  return planRank(plan) >= planRank(required);
}
