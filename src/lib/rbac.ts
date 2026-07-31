import type { UserRole } from "@/types";

/** What each persona can see / do in Omniv */
export const PERSONA = {
  artist: {
    label: "DIY Artist",
    focus: "Simplicity & automation — your data only",
    canSwitchRoster: false,
    canCrossPromote: false,
    canDeepSegment: false,
    fanLimitKey: "own",
  },
  manager: {
    label: "Boutique Manager",
    focus: "Roster toggle, consolidated growth, multi-artist CRM",
    canSwitchRoster: true,
    canCrossPromote: false,
    canDeepSegment: true,
    fanLimitKey: "roster",
  },
  label: {
    label: "Independent Label",
    focus: "Cross-roster aggregation, advanced segmentation, scale",
    canSwitchRoster: true,
    canCrossPromote: true,
    canDeepSegment: true,
    fanLimitKey: "org",
  },
} as const;

export function personaForRole(role: UserRole | null | undefined) {
  if (role === "manager") return PERSONA.manager;
  if (role === "label") return PERSONA.label;
  return PERSONA.artist;
}

export function canAccessCrm(role: UserRole | null | undefined) {
  return role === "manager" || role === "label" || role === "artist";
}

export function canAccessLabelDash(role: UserRole | null | undefined) {
  return role === "label";
}
