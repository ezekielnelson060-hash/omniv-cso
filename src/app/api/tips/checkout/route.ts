import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** Standalone tip checkout — no room required. */
export async function POST(req: Request) {
  const secret = process.env.FLW_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "Flutterwave not configured (FLW_SECRET_KEY)" },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as {
      slug?: string;
      userId?: string;
      email?: string;
      name?: string;
      amountUsd?: number;
    };
    const email = body.email?.trim().toLowerCase();
    const amount = Math.max(0, Number(body.amountUsd || 0));
    if (!email || amount < 1) {
      return NextResponse.json(
        { error: "email and amountUsd (>=1) required" },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const service =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !service) {
      return NextResponse.json({ error: "Supabase missing" }, { status: 503 });
    }

    const admin = createClient(url, service, {
      auth: { persistSession: false },
    });

    let userId = (body.userId || "").trim();
    let artistName = "Artist";

    if (!userId && body.slug) {
      const { data: roster } = await admin
        .from("roster_artists")
        .select("user_id, stage_name, slug")
        .eq("slug", body.slug.trim())
        .maybeSingle();
      if (roster?.user_id) {
        userId = roster.user_id as string;
        artistName = String(roster.stage_name || "Artist");
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Artist not found — need slug or userId" },
        { status: 404 }
      );
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, payout_subaccount_id, flw_subaccount_id")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.full_name) artistName = String(profile.full_name);

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "https://www.omniv.media";

    const txRef = `tip-${userId.slice(0, 8)}-${Date.now()}`;
    const payload: Record<string, unknown> = {
      tx_ref: txRef,
      amount,
      currency: process.env.FLW_CURRENCY || "USD",
      redirect_url: `${origin}/tip/${body.slug || "thanks"}?paid=1`,
      customer: {
        email,
        name: body.name?.trim() || email.split("@")[0],
      },
      customizations: {
        title: `Tip · ${artistName}`,
        description: `Support ${artistName} on Omniv`,
      },
      meta: {
        is_tip: true,
        artist_user_id: userId,
        tip_display_name: body.name?.trim() || "",
      },
    };

    const subId =
      (profile as { payout_subaccount_id?: string } | null)
        ?.payout_subaccount_id ||
      (profile as { flw_subaccount_id?: string } | null)?.flw_subaccount_id;
    if (subId) {
      payload.subaccounts = [
        {
          id: subId,
          transaction_split_ratio: 9,
          transaction_charge_type: "percentage",
          transaction_charge: 10,
        },
      ];
    }

    const flw = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = (await flw.json()) as {
      status?: string;
      data?: { link?: string };
      message?: string;
    };

    if (!flw.ok || !json.data?.link) {
      return NextResponse.json(
        { error: json.message || "Checkout failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, link: json.data.link, txRef });
  } catch (e) {
    console.error("tip checkout", e);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }
}
