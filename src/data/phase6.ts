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

/** Flutterwave is the live payment provider (from original Omniv stack). */
export const paymentProvider = {
  name: "Flutterwave",
  status: "connected" as const,
  note: "Existing Flutterwave connection preserved — do not replace with Stripe.",
  publicKeyEnv: "NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY",
  secretKeyEnv: "FLUTTERWAVE_SECRET_KEY",
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 19,
    currency: "USD",
    blurb: "Solo artists getting a command centre",
    features: [
      "Command Center + scores",
      "Opportunity Feed",
      "Ziki chat (limited)",
      "Artist Brain",
      "1 workspace",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 49,
    currency: "USD",
    blurb: "Artists and managers shipping weekly",
    highlighted: true,
    features: [
      "Everything in Starter",
      "Release Simulator",
      "Content Intelligence",
      "Historical Analytics",
      "Manager CRM (up to 5 artists)",
      "PDF reports",
    ],
  },
  {
    id: "label",
    name: "Label",
    priceMonthly: 149,
    currency: "USD",
    blurb: "Labels and multi-manager teams",
    features: [
      "Everything in Pro",
      "Label Dashboard",
      "Unlimited roster seats",
      "Team roles & permissions",
      "API access",
      "Priority support",
    ],
  },
];

export interface Integration {
  id: string;
  name: string;
  category: string;
  connected: boolean;
  description: string;
}

export const integrations: Integration[] = [
  {
    id: "spotify",
    name: "Spotify for Artists",
    category: "Streaming",
    connected: true,
    description: "Streams, listeners, playlist adds",
  },
  {
    id: "apple",
    name: "Apple Music for Artists",
    category: "Streaming",
    connected: false,
    description: "Plays, listeners, Shazam",
  },
  {
    id: "youtube",
    name: "YouTube",
    category: "Video",
    connected: true,
    description: "Views, watch time, Shorts",
  },
  {
    id: "tiktok",
    name: "TikTok",
    category: "Social",
    connected: true,
    description: "Views, shares, sound usage",
  },
  {
    id: "instagram",
    name: "Instagram / Meta",
    category: "Social",
    connected: false,
    description: "Reels, reach, engagement",
  },
  {
    id: "flutterwave",
    name: "Flutterwave",
    category: "Billing",
    connected: true,
    description: "Subscriptions & one-time payments (live)",
  },
  {
    id: "openai",
    name: "OpenAI",
    category: "AI",
    connected: true,
    description: "Ziki reasoning & content generation",
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "Infrastructure",
    connected: true,
    description: "Auth, database, storage",
  },
];

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: "opportunity" | "system" | "billing" | "team";
}

export const mockNotifications: AppNotification[] = [
  {
    id: "n1",
    title: "High-impact opportunity",
    body: "Playlist pitch window opens in 48h for Afterglow — act from Opportunity Feed.",
    time: "12m ago",
    read: false,
    type: "opportunity",
  },
  {
    id: "n2",
    title: "Artist Brain updated",
    body: "Brand voice note saved. Ziki will use it on the next briefing.",
    time: "2h ago",
    read: false,
    type: "system",
  },
  {
    id: "n3",
    title: "Flutterwave · Pro plan active",
    body: "Your Pro subscription renewed successfully.",
    time: "Yesterday",
    read: true,
    type: "billing",
  },
  {
    id: "n4",
    title: "Team invite accepted",
    body: "Jordan Okoye joined the workspace as Manager.",
    time: "2d ago",
    read: true,
    type: "team",
  },
  {
    id: "n5",
    title: "Momentum alert",
    body: "Mira Sol score dipped below 70 — review CRM recovery task.",
    time: "3d ago",
    read: true,
    type: "opportunity",
  },
];

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

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Manager" | "Analyst" | "Viewer";
}

export const mockTeam: TeamMember[] = [
  {
    id: "u1",
    name: "You",
    email: "you@omniv.app",
    role: "Owner",
  },
  {
    id: "u2",
    name: "Jordan Okoye",
    email: "jordan@blackwave.lab",
    role: "Manager",
  },
  {
    id: "u3",
    name: "Sam Rivera",
    email: "sam@blackwave.lab",
    role: "Analyst",
  },
];
