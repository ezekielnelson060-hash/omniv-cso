export type PlanId = "starter" | "pro" | "label";

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  currency: string;
  blurb: string;
  features: string[];
  highlighted?: boolean;
}

export const paymentProvider = {
  name: "Flutterwave",
  status: "connected" as const,
  note: "Checkout amounts are sent live from the app. Plan unlocks after webhook confirmation.",
  publicKeyEnv: "NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY",
  secretKeyEnv: "FLW_SECRET_KEY",
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 29,
    currency: "USD",
    blurb: "Solo artists — feed + analytics",
    features: [
      "Command Center + scores",
      "Opportunity Feed",
      "Historical Analytics",
      "Surface scan",
      "Ziki (daily limit)",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 59,
    currency: "USD",
    blurb: "Artists & managers shipping weekly",
    highlighted: true,
    features: [
      "Everything in Starter",
      "Release Simulator",
      "Content Intelligence",
      "Manager CRM",
      "Team seats",
      "Unlimited Ziki",
    ],
  },
  {
    id: "label",
    name: "Label",
    priceMonthly: 179,
    currency: "USD",
    blurb: "Labels and multi-manager teams",
    features: [
      "Everything in Pro",
      "Label Dashboard",
      "Unlimited roster",
      "API access",
      "Priority support",
    ],
  },
];

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Manager" | "Analyst" | "Viewer";
}
