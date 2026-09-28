export type DiscoveryPlanId = "free" | "pro" | "business";

export type DiscoveryPlan = {
  id: DiscoveryPlanId;
  name: string;
  priceMonthlyUsd: number;
  billingInterval: "monthly";
  billingLabel: string;
  blurb: string;
  features: string[];
};

export const DISCOVERY_PLANS: Record<DiscoveryPlanId, DiscoveryPlan> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthlyUsd: 0,
    billingInterval: "monthly",
    billingLabel: "forever",
    blurb: "Publish, explore, and build your network without a paywall.",
    features: [
      "Personal profile",
      "Independent entities",
      "Unlimited publishing",
      "Explore, follow, and save",
      "Basic discovery stats",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthlyUsd: 29,
    billingInterval: "monthly",
    billingLabel: "/ month",
    blurb:
      "Build a stronger identity and understand what is moving through the network.",
    features: [
      "Everything in Free",
      "Deeper discovery stats",
      "Audience insights",
      "Discovery sources",
      "Publication performance",
      "Follower growth",
      "Scheduling",
      "Collections",
      "Lead capture",
      "Enhanced profile",
      "Verified publisher for one entity",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    priceMonthlyUsd: 99,
    billingInterval: "monthly",
    billingLabel: "/ month",
    blurb:
      "For companies and teams running multiple identities on Omniv.",
    features: [
      "Everything in Pro",
      "Verified on all your entities",
      "Team-ready (seats)",
      "Private publications",
      "Priority support",
      "Full analytics export",
      "Promote credits priority",
    ],
  },
};

/** Flutterwave IDs for indefinite monthly subscriptions. */
export const FLUTTERWAVE_PAYMENT_PLAN_IDS = {
  pro: process.env.FLW_PRO_PAYMENT_PLAN_ID || "",
  business: process.env.FLW_BUSINESS_PAYMENT_PLAN_ID || "",
  verify: process.env.FLW_VERIFY_PAYMENT_PLAN_ID || "",
} as const;

export const VERIFY_MONTHLY_USD = 9;

export function paymentPlanIdFor(
  plan: "pro" | "business" | "verify"
): number | null {
  const raw = FLUTTERWAVE_PAYMENT_PLAN_IDS[plan].trim();
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const PROMOTION_CONFIG = {
  minBudgetUsd: 10,
  maxBudgetUsd: 500,
  defaultBudgetUsd: 50,
  durations: [3, 7, 14] as const,
  targetTypes: [
    "publication",
    "entity",
    "product",
    "event",
    "opportunity",
  ] as const,
};

/** @deprecated use DISCOVERY_PLANS.business.priceMonthlyUsd */
export const LEGACY_CHECKOUT_AMOUNTS = {
  business: DISCOVERY_PLANS.business.priceMonthlyUsd,
  label: DISCOVERY_PLANS.business.priceMonthlyUsd,
} as const;

export type PromotionTargetType = (typeof PROMOTION_CONFIG.targetTypes)[number];

export function planAmountUsd(plan: DiscoveryPlanId): number {
  return DISCOVERY_PLANS[plan].priceMonthlyUsd;
}

export function isPaidDiscoveryPlan(
  plan: string | null | undefined
): plan is "pro" | "business" {
  return plan === "pro" || plan === "business" || plan === "label";
}

export function normalizeDiscoveryPlan(
  plan: string | null | undefined
): DiscoveryPlanId {
  if (plan === "business" || plan === "label") return "business";
  if (plan === "pro" || plan === "starter") return "pro";
  return "free";
}

export function checkoutPricesUsd(): Record<string, number> {
  return {
    pro: DISCOVERY_PLANS.pro.priceMonthlyUsd,
    business: DISCOVERY_PLANS.business.priceMonthlyUsd,
    starter: DISCOVERY_PLANS.pro.priceMonthlyUsd,
    label: DISCOVERY_PLANS.business.priceMonthlyUsd,
    verify: VERIFY_MONTHLY_USD,
  };
}
