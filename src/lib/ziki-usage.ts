/**
 * Daily Ziki message quota by plan.
 * Soft-persists via Supabase table `ziki_usage` when present.
 * SQL (run once in Supabase):
 *
 * create table if not exists public.ziki_usage (
 *   user_id uuid not null references auth.users(id) on delete cascade,
 *   day date not null,
 *   count int not null default 0,
 *   primary key (user_id, day)
 * );
 * alter table public.ziki_usage enable row level security;
 * -- service role / server only writes; no client policies needed if using service client
 */

import { planById, type PlanId } from "@/lib/billing";

export function zikiDailyLimit(plan: string | null | undefined): number | "unlimited" {
  const id = (plan || "free").toLowerCase() as PlanId;
  const def = planById(
    id === "starter" || id === "pro" || id === "label" || id === "free"
      ? id
      : "free"
  );
  return def.limits.zikiMessagesPerDay;
}

export function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

type UsageClient = {
  from: (table: string) => {
    select: (cols: string) => {
      eq: (a: string, v: string) => {
        eq: (b: string, v2: string) => {
          maybeSingle: () => Promise<{ data: { count?: number } | null; error: unknown }>;
        };
      };
    };
    upsert: (
      row: Record<string, unknown>,
      opts?: { onConflict?: string }
    ) => Promise<{ error: unknown }>;
  };
};

/** Returns { allowed, used, limit }. If table missing, allows (soft). */
export async function checkAndIncrementZikiUsage(
  supabase: UsageClient,
  userId: string,
  plan: string | null | undefined
): Promise<{
  allowed: boolean;
  used: number;
  limit: number | "unlimited";
  day: string;
}> {
  const limit = zikiDailyLimit(plan);
  const day = utcDay();

  if (limit === "unlimited") {
    return { allowed: true, used: 0, limit, day };
  }

  try {
    const { data, error } = await supabase
      .from("ziki_usage")
      .select("count")
      .eq("user_id", userId)
      .eq("day", day)
      .maybeSingle();

    if (error) {
      console.warn("ziki_usage read skipped", error);
      return { allowed: true, used: 0, limit, day };
    }

    const used = data?.count ?? 0;
    if (used >= limit) {
      return { allowed: false, used, limit, day };
    }

    const next = used + 1;
    const { error: upErr } = await supabase.from("ziki_usage").upsert(
      { user_id: userId, day, count: next },
      { onConflict: "user_id,day" }
    );
    if (upErr) console.warn("ziki_usage upsert skipped", upErr);

    return { allowed: true, used: next, limit, day };
  } catch (e) {
    console.warn("ziki_usage exception", e);
    return { allowed: true, used: 0, limit, day };
  }
}
