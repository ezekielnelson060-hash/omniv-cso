export type DiscoveryPlanId = "free" | "pro";

export type DiscoveryPlan = {
  id: DiscoveryPlanId;
  name: string;
  priceMonthlyUsd: number;
  billingLabel: string;
  blurb: string;
  features: string[];
};

export const DISCOVERY_PLANS: Record<DiscoveryPlanId, DiscoveryPlan> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthlyUsd: 0,
    billingLabel: "forever",
    blurb: "Publish, explore, and build your network without a paywall.",
    features: [
      "Personal profile",
      "Independent entities",
      "Unlimited publishing",
      "Explore, follow, and save",
      "Basic analytics",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthlyUsd: 29,
    billingLabel: "/ month",
    blurb: "Build a stronger identity and understand what is moving through the network.",
    features: [
      "Advanced analytics",
      "Audience insights",
      "Discovery sources",
      "Publication performance",
      "Follower growth",
      "Scheduling",
      "Collections",
      "Lead capture",
      "Enhanced profile",
      "Verified publisher status for the selected entity",
    ],
  },
};

export const PROMOTION_CONFIG = {
  minBudgetUsd: 10,
  maxBudgetUsd: 500,
  defaultBudgetUsd: 50,
  durations: [3, 7, 14] as const,
  targetTypes: ["publication", "entity", "product", "event", "opportunity"] as const,
};

/** Kept for older settings screens while discovery billing moves to Pro. */
export const LEGACY_CHECKOUT_AMOUNTS = {
  business: 99,
  label: 99,
} as const;

export type PromotionTargetType = (typeof PROMOTION_CONFIG.targetTypes)[number];

export function planAmountUsd(plan: DiscoveryPlanId): number {
  return DISCOVERY_PLANS[plan].priceMonthlyUsd;
}
