import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** Flutterwave checkout for gathering ticket, tip, or free RSVP. */
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
      gatheringId?: string;
      email?: string;
      name?: string;
      tipUsd?: number;
    };
    const gatheringId = body.gatheringId?.trim();
    const email = body.email?.trim().toLowerCase();
    if (!gatheringId || !email) {
      return NextResponse.json(
        { error: "gatheringId and email required" },
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

    const { data: g, error } = await admin
      .from("gatherings")
      .select("id, title, ticket_price_cents, status, city, capacity")
      .eq("id", gatheringId)
      .maybeSingle();

    if (error || !g) {
      return NextResponse.json({ error: "Gathering not found" }, { status: 404 });
    }
    if (g.status !== "open") {
      return NextResponse.json(
        { error: "This gathering is not open for RSVP" },
        { status: 400 }
      );
    }

    const ticket = Math.max(0, Number(g.ticket_price_cents || 0) / 100);
    const tip = Math.max(0, Number(body.tipUsd || 0));
    const isTip = tip > 0;
    const amount = isTip ? tip : ticket;
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "https://www.omniv.media";

    if (amount <= 0) {
      await admin.from("gathering_rsvps").upsert(
        {
          gathering_id: gatheringId,
          email,
          status: "going",
        },
        { onConflict: "gathering_id,email" }
      );
      return NextResponse.json({
        ok: true,
        free: true,
        message: "You are on the list",
      });
    }

    const tx_ref = `omniv_gath_${gatheringId.slice(0, 8)}_${Date.now()}`;
    const payload = {
      tx_ref,
      amount,
      currency: process.env.FLW_CURRENCY || "USD",
      redirect_url: `${origin}/g/${gatheringId}?paid=1`,
      customer: {
        email,
        name: body.name || "Fan",
      },
      customizations: {
        title: isTip ? "Omniv Tip" : "Omniv Gathering",
        description: isTip ? `Tip · ${g.title}` : (g.title as string),
      },
      meta: {
        type: "gathering",
        gathering_id: gatheringId,
        email,
        is_tip: isTip,
      },
    };

    const res = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {
      status?: string;
      message?: string;
      data?: { link?: string };
    };
    if (!res.ok || !data.data?.link) {
      console.error("FLW gathering", data);
      return NextResponse.json(
        { error: data.message || "Could not start payment" },
        { status: 502 }
      );
    }

    await admin.from("gathering_rsvps").upsert(
      {
        gathering_id: gatheringId,
        email,
        status: "going",
      },
      { onConflict: "gathering_id,email" }
    );

    return NextResponse.json({ ok: true, link: data.data.link });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
