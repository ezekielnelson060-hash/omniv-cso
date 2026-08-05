/**
 * Ziki message quota by plan.
 * Free = 5 / calendar month. Starter = 20 / day. Pro/Label = unlimited.
 * Soft-persists via Supabase table `ziki_usage` when present.
 *
 * SQL (run once in Supabase):
 *
 * create table if not exists public.ziki_usage (
 *   user_id uuid not null references auth.users(id) on delete cascade,
 *   day text not null,
 *   count int not null default 0,
 *   primary key (user_id, day)
 * );
 * alter table public.ziki_usage enable row level security;
 */

import { planById, type PlanId } from "@/lib/billing";

export type ZikiPeriodKind = "day" | "month";

export function zikiQuota(plan: string | null | undefined): {
  limit: number | "unlimited";
  period: ZikiPeriodKind;
  label: string;
} {
  const id = (plan || "free").toLowerCase() as PlanId;
  const normalized: PlanId =
    id === "starter" || id === "pro" || id === "label" || id === "free"
      ? id
      : "free";
  const def = planById(normalized);
  const limit = def.limits.zikiMessagesPerDay;

  if (limit === "unlimited") {
    return { limit: "unlimited", period: "day", label: "unlimited" };
  }
  if (normalized === "free") {
    return { limit, period: "month", label: `${limit} / month` };
  }
  return { limit, period: "day", label: `${limit} / day` };
}

/** @deprecated use zikiQuota */
export function zikiDailyLimit(plan: string | null | undefined): number | "unlimited" {
  return zikiQuota(plan).limit;
}

export function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

export function utcMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/** Bucket key stored in ziki_usage.day (date or YYYY-MM). */
export function usageBucket(plan: string | null | undefined): {
  key: string;
  period: ZikiPeriodKind;
  limit: number | "unlimited";
  label: string;
} {
  const q = zikiQuota(plan);
  const key = q.period === "month" ? utcMonth() : utcDay();
  return { key, period: q.period, limit: q.limit, label: q.label };
}

/** Returns { allowed, used, limit }. If table missing, allows (soft). */
export async function checkAndIncrementZikiUsage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  plan: string | null | undefined
): Promise<{
  allowed: boolean;
  used: number;
  limit: number | "unlimited";
  day: string;
  period: ZikiPeriodKind;
  label: string;
}> {
  const { key, period, limit, label } = usageBucket(plan);

  if (limit === "unlimited") {
    return { allowed: true, used: 0, limit, day: key, period, label };
  }

  try {
    const { data, error } = await supabase
      .from("ziki_usage")
      .select("count")
      .eq("user_id", userId)
      .eq("day", key)
      .maybeSingle();

    if (error) {
      console.warn("ziki_usage read skipped", error);
      return { allowed: true, used: 0, limit, day: key, period, label };
    }

    const used = (data?.count as number | undefined) ?? 0;
    if (used >= limit) {
      return { allowed: false, used, limit, day: key, period, label };
    }

    const next = used + 1;
    const { error: upErr } = await supabase.from("ziki_usage").upsert(
      { user_id: userId, day: key, count: next },
      { onConflict: "user_id,day" }
    );
    if (upErr) console.warn("ziki_usage upsert skipped", upErr);

    return { allowed: true, used: next, limit, day: key, period, label };
  } catch (e) {
    console.warn("ziki_usage soft-fail", e);
    return { allowed: true, used: 0, limit, day: key, period, label };
  }
}
