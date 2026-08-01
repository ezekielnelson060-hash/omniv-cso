/**
 * Fan engagement scoring + decay.
 *
 * Model:
 * - Actions add fixed points (matrix below).
 * - Inactivity applies compound monthly decay after a grace window.
 * - Tier is derived from decayed score + subscription status.
 * - Unsubscribe / bounce zero the score.
 */

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

/** Days before decay starts */
export const DECAY_GRACE_DAYS = 30;

/** Multiplier applied once per full 30-day inactive period after grace */
export const DECAY_FACTOR = 0.85;

/** Soft floor so engaged-but-quiet fans don't fall to absolute zero overnight */
export const DECAY_FLOOR = 0;

export type FanTier =
  | "Superfan"
  | "Core Fan"
  | "Casual"
  | "Cold"
  | "Unsubscribed";

export const TIER_THRESHOLDS = {
  superfan: 50,
  core: 21,
  casual: 1,
} as const;

export function tierFromScore(
  score: number,
  subscribed: boolean
): FanTier {
  if (!subscribed) return "Unsubscribed";
  if (score >= TIER_THRESHOLDS.superfan) return "Superfan";
  if (score >= TIER_THRESHOLDS.core) return "Core Fan";
  if (score >= TIER_THRESHOLDS.casual) return "Casual";
  return "Cold";
}

/**
 * Compound decay: every full 30 days past grace multiplies score by DECAY_FACTOR.
 * Example: score 100, inactive 90 days → grace 30, 2 periods → 100 * 0.85^2 ≈ 72.
 */
export function applyDecay(score: number, daysInactive: number): number {
  if (daysInactive < DECAY_GRACE_DAYS) return score;
  const periods = Math.floor(
    (daysInactive - DECAY_GRACE_DAYS) / DECAY_GRACE_DAYS + 1
  );
  // periods: at day 30 → 1 application; day 60 → 2, etc.
  let s = score;
  for (let i = 0; i < periods; i++) {
    s = Math.round(s * DECAY_FACTOR);
  }
  return Math.max(DECAY_FLOOR, s);
}

/** Continuous exponential decay (optional alternative for analytics charts) */
export function applyExponentialDecay(
  score: number,
  daysInactive: number,
  halfLifeDays = 45
): number {
  if (daysInactive <= 0) return score;
  const lambda = Math.LN2 / halfLifeDays;
  return Math.max(0, Math.round(score * Math.exp(-lambda * daysInactive)));
}

export function daysSince(iso: string | null | undefined, now = Date.now()): number {
  if (!iso) return 999;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 999;
  return Math.max(0, Math.floor((now - t) / (1000 * 60 * 60 * 24)));
}

export function recomputeFanState(input: {
  engagementScore: number;
  lastActiveAt: string | null;
  isEmailSubscribed: boolean;
  isSmsSubscribed?: boolean;
}): { score: number; tier: FanTier; daysInactive: number } {
  const daysInactive = daysSince(input.lastActiveAt);
  const subscribed = Boolean(
    input.isEmailSubscribed || input.isSmsSubscribed
  );
  const score = applyDecay(input.engagementScore, daysInactive);
  const tier = tierFromScore(score, subscribed);
  return { score, tier, daysInactive };
}

export function scoreAfterAction(
  current: number,
  actionType: string
): number {
  const delta = ACTION_POINTS[actionType] ?? 0;
  if (actionType === "unsubscribe" || actionType === "bounce") return 0;
  return Math.max(0, current + delta);
}

export const PLAN_FAN_LIMITS: Record<string, number> = {
  free: 500,
  starter: 1000,
  pro: 10000,
  label: 100000,
};
