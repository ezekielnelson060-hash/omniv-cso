/** Point matrix + tier rules for owned-fan scoring */

export const ACTION_POINTS: Record<string, number> = {
  form_submit: 10,
  email_open: 2,
  email_click: 5,
  sms_click: 8,
  content_unlock: 15,
  tour_rsvp: 30,
  merch_purchase: 40,
  unsubscribe: -100,
  bounce: -100,
};

export type FanTier =
  | "Superfan"
  | "Core Fan"
  | "Casual"
  | "Cold"
  | "Unsubscribed";

export function tierFromScore(
  score: number,
  subscribed: boolean
): FanTier {
  if (!subscribed) return "Unsubscribed";
  if (score >= 50) return "Superfan";
  if (score >= 21) return "Core Fan";
  if (score >= 1) return "Casual";
  return "Cold";
}

export function applyDecay(score: number, daysInactive: number): number {
  if (daysInactive < 30) return score;
  const periods = Math.floor(daysInactive / 30);
  let s = score;
  for (let i = 0; i < periods; i++) s = Math.round(s * 0.85);
  return Math.max(0, s);
}

export function scoreAfterAction(
  current: number,
  actionType: string
): number {
  const delta = ACTION_POINTS[actionType] ?? 0;
  if (actionType === "unsubscribe" || actionType === "bounce") return 0;
  return Math.max(0, current + delta);
}

/** Plan contact ceilings — gate capture + CRM features */
export const PLAN_FAN_LIMITS: Record<string, number> = {
  free: 500,
  starter: 1000,
  pro: 10000,
  label: 100000,
};
