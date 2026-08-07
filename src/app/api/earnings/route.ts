import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdmin } from "@supabase/supabase-js";

/** Artist earnings from gatherings/tips. */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !service) {
      return NextResponse.json({ error: "Server not configured" }, { status: 503 });
    }
    const admin = createAdmin(url, service, {
      auth: { persistSession: false },
    });

    const { data: gatherings } = await admin
      .from("gatherings")
      .select("id, title")
      .eq("user_id", user.id);
    const ids = (gatherings || []).map((g) => g.id as string);
    const titleById = Object.fromEntries(
      (gatherings || []).map((g) => [g.id as string, g.title as string])
    );

    if (ids.length === 0) {
      return NextResponse.json({
        total: 0,
        currency: process.env.FLW_CURRENCY || "USD",
        rows: [],
        hasSubaccount: false,
      });
    }

    const { data: pays } = await admin
      .from("payments")
      .select("amount, currency, status, tx_ref, created_at, email, plan, raw")
      .eq("plan", "gathering")
      .eq("status", "successful")
      .order("created_at", { ascending: false })
      .limit(100);

    const rows = (pays || []).filter((p) => {
      const raw = p.raw as { meta?: { gathering_id?: string } } | null;
      const gid = raw?.meta?.gathering_id;
      if (gid && ids.includes(gid)) return true;
      const ref = String(p.tx_ref || "");
      return ids.some((id) => ref.includes(id.slice(0, 8)));
    });

    const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0);

    const { data: prof } = await admin
      .from("profiles")
      .select("payout_subaccount_id")
      .eq("id", user.id)
      .maybeSingle();

    return NextResponse.json({
      total,
      currency: rows[0]?.currency || process.env.FLW_CURRENCY || "USD",
      rows: rows.map((r) => {
        const raw = r.raw as {
          meta?: { gathering_id?: string; is_tip?: boolean };
        } | null;
        const gid = raw?.meta?.gathering_id;
        return {
          amount: r.amount,
          currency: r.currency,
          email: r.email,
          at: r.created_at,
          title: gid ? titleById[gid] || "Gathering" : "Gathering",
          isTip: Boolean(raw?.meta?.is_tip),
        };
      }),
      hasSubaccount: Boolean(prof?.payout_subaccount_id),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
