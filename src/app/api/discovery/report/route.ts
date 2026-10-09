import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const REASONS = new Set([
  "spam",
  "harassment",
  "misinformation",
  "impersonation",
  "illegal",
  "copyright",
  "other",
]);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await req.json();
    const targetKind = String(body.targetKind || "").trim();
    const reason = String(body.reason || "").trim().toLowerCase();
    const details = String(body.details || "").trim().slice(0, 2000);
    const targetId = body.targetId ? String(body.targetId) : null;
    const targetSlug = body.targetSlug ? String(body.targetSlug) : null;

    if (!["publication", "entity", "user"].includes(targetKind)) {
      return NextResponse.json({ error: "Invalid target" }, { status: 400 });
    }
    if (!REASONS.has(reason)) {
      return NextResponse.json(
        { error: "Invalid reason", allowed: [...REASONS] },
        { status: 400 }
      );
    }
    if (!targetId && !targetSlug) {
      return NextResponse.json(
        { error: "targetId or targetSlug required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("discovery_reports")
      .insert({
        reporter_id: user.id,
        target_kind: targetKind,
        target_id: targetId,
        target_slug: targetSlug,
        reason,
        details: details || null,
        status: "open",
      })
      .select("id, status, created_at")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          hint: "Run migration 050_discovery_hardening.sql",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, report: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
