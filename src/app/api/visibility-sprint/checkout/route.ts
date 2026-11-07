import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const AMOUNT_USD = 300;

/**
 * Start Product Visibility Sprint checkout.
 * Creates a pending order, then returns Flutterwave payment link.
 * Order is only marked paid after server-side verify (or webhook).
 */
export async function POST(req: Request) {
  const secret = process.env.FLW_SECRET_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    return NextResponse.json(
      { error: "Payments not configured. Add FLW_SECRET_KEY." },
      { status: 503 }
    );
  }
  if (!url || !service) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      company?: string;
      website?: string;
      description?: string;
    };

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const company = String(body.company || "").trim();
    const website = String(body.website || "").trim();
    const description = String(body.description || "").trim();

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid business email is required." }, { status: 400 });
    }
    if (!company || company.length < 2) {
      return NextResponse.json({ error: "Company / product name is required." }, { status: 400 });
    }
    if (!description || description.length < 20) {
      return NextResponse.json(
        { error: "Please describe your product in at least a short paragraph." },
        { status: 400 }
      );
    }

    const admin = createClient(url, service, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const tx_ref = `omniv_visibility_sprint_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const currency = process.env.FLW_CURRENCY || "USD";

    const { data: order, error: orderError } = await admin
      .from("visibility_sprint_orders")
      .insert({
        status: "pending",
        customer_name: name,
        customer_email: email,
        company_name: company,
        website: website || null,
        product_description: description,
        amount: AMOUNT_USD,
        currency,
        tx_ref,
      })
      .select("id")
      .single();

    if (orderError || !order?.id) {
      console.error("[visibility-sprint] order insert", orderError);
      return NextResponse.json(
        { error: "Could not create order. Try again." },
        { status: 500 }
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "https://omniv.media";

    const redirect_url = `${origin}/visibility-sprint/success?tx_ref=${encodeURIComponent(tx_ref)}`;

    const payload = {
      tx_ref,
      amount: AMOUNT_USD,
      currency,
      redirect_url,
      customer: {
        email,
        name,
      },
      customizations: {
        title: "Omniv Visibility Sprint",
        description: `Product Visibility Sprint — $${AMOUNT_USD} one-time`,
        logo: `${origin}/logo.svg`,
      },
      meta: {
        product: "visibility_sprint",
        plan: "visibility_sprint",
        order_id: order.id,
        company,
        amount: String(AMOUNT_USD),
        currency,
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

    const data = await res.json();
    if (!res.ok || !data?.data?.link) {
      console.error("[visibility-sprint] flw", data);
      await admin
        .from("visibility_sprint_orders")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", order.id);
      return NextResponse.json(
        { error: data?.message || "Payment init failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      link: data.data.link as string,
      tx_ref,
      order_id: order.id,
    });
  } catch (e) {
    console.error("[visibility-sprint] checkout", e);
    return NextResponse.json({ error: "Checkout unavailable" }, { status: 500 });
  }
}
