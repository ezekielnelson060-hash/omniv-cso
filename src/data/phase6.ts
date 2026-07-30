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

/** @deprecated Use team-store — kept empty so old imports compile */
export const mockTeam: TeamMember[] = [];

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: "opportunity" | "system" | "billing" | "team";
}

/** Start empty — product notifications appear as the user acts */
export const mockNotifications: AppNotification[] = [];

export type ReportType =
  | "investor"
  | "artist"
  | "campaign"
  | "monthly"
  | "label";

export interface ReportTemplate {
  id: ReportType;
  name: string;
  description: string;
  pages: string;
}

export const reportTemplates: ReportTemplate[] = [
  {
    id: "investor",
    name: "Investor report",
    description: "Growth, scores, pipeline, and capital efficiency narrative",
    pages: "8–12 pp",
  },
  {
    id: "artist",
    name: "Artist report",
    description: "Personal scorecard, opportunities, next moves",
    pages: "4–6 pp",
  },
  {
    id: "campaign",
    name: "Campaign report",
    description: "Single release or campaign performance + recommendations",
    pages: "3–5 pp",
  },
  {
    id: "monthly",
    name: "Monthly growth",
    description: "Month-over-month streams, social, content, CRM",
    pages: "6–8 pp",
  },
  {
    id: "label",
    name: "Label report",
    description: "Portfolio comparison, managers, campaign roll-up",
    pages: "10–14 pp",
  },
];
