import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createService } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function service() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createService(url, key);
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const allow = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    if (!allow.includes(user.email.toLowerCase())) {
      return NextResponse.json(
        { error: "Not an admin. Set ADMIN_EMAILS in Vercel to your email." },
        { status: 403 }
      );
    }

    const svc = service();
    if (!svc) {
      return NextResponse.json(
        { error: "Service role not configured" },
        { status: 500 }
      );
    }

    const { data: payments, error } = await svc
      .from("payments")
      .select("amount_cents, status, meta, user_id")
      .eq("status", "successful")
      .limit(2000);

    if (error) {
      const alt = await svc.from("payments").select("*").limit(500);
      if (alt.error) {
        return NextResponse.json({ error: alt.error.message }, { status: 500 });
      }
    }

    const byUser = new Map<
      string,
      { total_cents: number; payments: number }
    >();

    for (const pay of payments || []) {
      const meta = (pay as { meta?: Record<string, unknown> }).meta || {};
      const owner =
        (meta.owner_user_id as string) ||
        (pay as { user_id?: string }).user_id;
      if (!owner) continue;
      const cents = Number((pay as { amount_cents?: number }).amount_cents || 0);
      const cur = byUser.get(owner) || { total_cents: 0, payments: 0 };
      cur.total_cents += cents;
      cur.payments += 1;
      byUser.set(owner, cur);
    }

    const ids = [...byUser.keys()];
    if (ids.length === 0) {
      return NextResponse.json({ rows: [] });
    }

    const { data: profiles } = await svc
      .from("profiles")
      .select(
        "id, email, full_name, tip_display_name, payout_bank_name, payout_account_name, payout_account_number, payout_method, payout_notes"
      )
      .in("id", ids);

    const rows = (profiles || []).map((p) => {
      const agg = byUser.get(p.id) || { total_cents: 0, payments: 0 };
      return {
        user_id: p.id,
        email: p.email,
        full_name: p.full_name,
        tip_name: p.tip_display_name,
        bank: p.payout_bank_name,
        account_name: p.payout_account_name,
        account_number: p.payout_account_number,
        method: p.payout_method,
        notes: p.payout_notes,
        total_cents: agg.total_cents,
        payments: agg.payments,
      };
    });

    rows.sort((a, b) => b.total_cents - a.total_cents);
    return NextResponse.json({ rows });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
