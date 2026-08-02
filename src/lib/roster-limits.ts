/** Roster capacity by plan — managers/labels need multi-artist. */

export const ROSTER_LIMITS = {
  free: 1,
  starter: 3,
  pro: 20,
  label: 50,
} as const;

export type PlanKey = keyof typeof ROSTER_LIMITS;

export function rosterLimitForPlan(plan?: string | null): number {
  const p = (plan || "free").toLowerCase();
  if (p === "label" || p === "enterprise") return ROSTER_LIMITS.label;
  if (p === "pro" || p === "professional") return ROSTER_LIMITS.pro;
  if (p === "starter") return ROSTER_LIMITS.starter;
  return ROSTER_LIMITS.free;
}
