import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PROMOTION_CONFIG, type PromotionTargetType } from "@/lib/discovery/monetization";

const targetTypes = new Set<string>(PROMOTION_CONFIG.targetTypes);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    const body = await req.json();
    const targetType = String(body.targetType || "publication") as PromotionTargetType;
    const durationDays = Number(body.durationDays);
    const budget = Math.round(Number(body.budget));
    if (!targetTypes.has(targetType)) return NextResponse.json({ error: "Choose a valid promotion target" }, { status: 400 });
    if (!(PROMOTION_CONFIG.durations as readonly number[]).includes(durationDays)) return NextResponse.json({ error: "Choose a valid duration" }, { status: 400 });
    if (!Number.isFinite(budget) || budget < PROMOTION_CONFIG.minBudgetUsd || budget > PROMOTION_CONFIG.maxBudgetUsd) return NextResponse.json({ error: "Budget must be between $10 and $500" }, { status: 400 });

    const publisherId = body.publisherId ? String(body.publisherId) : null;
    if (publisherId) {
      const { data: entity } = await supabase.from("discovery_entities").select("id").eq("id", publisherId).eq("owner_id", user.id).maybeSingle();
      if (!entity) return NextResponse.json({ error: "You do not own this identity" }, { status: 403 });
    }
    const { data, error } = await supabase.from("discovery_promotions").insert({
      owner_id: user.id,
      publisher_id: publisherId,
      target_type: targetType,
      target_id: body.targetId || null,
      target_slug: body.targetSlug || null,
      target_title: String(body.targetTitle || "").slice(0, 180),
      audience: Array.isArray(body.audience) ? body.audience.slice(0, 8) : [],
      location: body.location ? String(body.location).slice(0, 80) : null,
      interests: Array.isArray(body.interests) ? body.interests.slice(0, 8) : [],
      duration_days: durationDays,
      budget,
      status: "pending_payment",
    }).select("id, status, budget, duration_days").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, promotion: data });
  } catch (error) {
    console.error("promotion create", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ promotions: [], auth: false }, { status: 401 });
    const { data, error } = await supabase.from("discovery_promotions").select("id, target_type, target_title, status, budget, duration_days, created_at, starts_at, ends_at").eq("owner_id", user.id).order("created_at", { ascending: false }).limit(50);
    if (error) return NextResponse.json({ promotions: [], error: error.message }, { status: 500 });
    return NextResponse.json({ auth: true, promotions: data || [] });
  } catch (error) {
    console.error("promotion list", error);
    return NextResponse.json({ promotions: [], error: "Promotion service is not configured" }, { status: 503 });
  }
}
