import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  applyDecay,
  tierFromScore,
  type FanTier,
} from "@/lib/fan-engagement";

/**
 * Nightly fan engagement recalculation.
 * - Sum interaction weights (stored score + decay by inactivity)
 * - Re-assign fan_tier
 *
 * GET /api/cron/fan-tiers
 * Authorization: Bearer CRON_SECRET
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    return NextResponse.json({ error: "Missing Supabase" }, { status: 500 });
  }

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: fans, error } = await admin
    .from("fans")
    .select(
      "id, engagement_score, last_active_at, is_email_subscribed, is_sms_subscribed, fan_tier"
    )
    .limit(5000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = Date.now();
  let updated = 0;
  const tierCounts: Record<string, number> = {};

  for (const fan of fans || []) {
    const last = fan.last_active_at
      ? new Date(fan.last_active_at).getTime()
      : now;
    const daysInactive = Math.max(
      0,
      Math.floor((now - last) / (1000 * 60 * 60 * 24))
    );
    const base = fan.engagement_score ?? 0;
    const decayed = applyDecay(base, daysInactive);
    const subscribed = Boolean(
      fan.is_email_subscribed || fan.is_sms_subscribed
    );
    const tier: FanTier = tierFromScore(decayed, subscribed);

    tierCounts[tier] = (tierCounts[tier] || 0) + 1;

    if (tier !== fan.fan_tier || decayed !== base) {
      const { error: uErr } = await admin
        .from("fans")
        .update({
          engagement_score: decayed,
          fan_tier: tier,
        })
        .eq("id", fan.id);
      if (!uErr) updated += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    scanned: fans?.length ?? 0,
    updated,
    tiers: tierCounts,
  });
}
