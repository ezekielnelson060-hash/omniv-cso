import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const PACKAGES = {
  mini: {
    id: "mini",
    label: "Product Visibility Mini-Sprint (35 pieces)",
    amount: 150,
  },
  full: {
    id: "full",
    label: "Product Visibility Full Sprint (70 pieces)",
    amount: 300,
  },
} as const;

type PackageKey = keyof typeof PACKAGES;

/**
 * Start Visibility Sprint checkout (mini $150 or full $300).
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
      package?: string;
      name?: string;
      email?: string;
      company?: string;
      website?: string;
      description?: string;
    };

    const packageKey = (String(body.package || "full").toLowerCase() === "mini"
      ? "mini"
      : "full") as PackageKey;
    const pack = PACKAGES[packageKey];

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
        { error: "Please describe your product or content in at least a short paragraph." },
        { status: 400 }
      );
    }

    const admin = createClient(url, service, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const tx_ref = `omniv_vs_${pack.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
        amount: pack.amount,
        currency,
        tx_ref,
        package: pack.id,
      })
      .select("id")
      .single();

    if (orderError || !order?.id) {
      const { data: order2, error: orderError2 } = await admin
        .from("visibility_sprint_orders")
        .insert({
          status: "pending",
          customer_name: name,
          customer_email: email,
          company_name: company,
          website: website || null,
          product_description: description,
          amount: pack.amount,
          currency,
          tx_ref,
        })
        .select("id")
        .single();

      if (orderError2 || !order2?.id) {
        console.error("[visibility-sprint] order insert", orderError || orderError2);
        return NextResponse.json(
          { error: "Could not create order. Try again." },
          { status: 500 }
        );
      }

      return await startFlutterwave({
        secret,
        admin,
        orderId: order2.id,
        tx_ref,
        pack,
        name,
        email,
        company,
        currency,
        origin:
          process.env.NEXT_PUBLIC_APP_URL ||
          req.headers.get("origin") ||
          "https://omniv.media",
      });
    }

    return await startFlutterwave({
      secret,
      admin,
      orderId: order.id,
      tx_ref,
      pack,
      name,
      email,
      company,
      currency,
      origin:
        process.env.NEXT_PUBLIC_APP_URL ||
        req.headers.get("origin") ||
        "https://omniv.media",
    });
  } catch (e) {
    console.error("[visibility-sprint] checkout", e);
    return NextResponse.json({ error: "Checkout unavailable" }, { status: 500 });
  }
}

async function startFlutterwave(opts: {
  secret: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any;
  orderId: string;
  tx_ref: string;
  pack: (typeof PACKAGES)[PackageKey];
  name: string;
  email: string;
  company: string;
  currency: string;
  origin: string;
}) {
  const {
    secret,
    admin,
    orderId,
    tx_ref,
    pack,
    name,
    email,
    company,
    currency,
    origin,
  } = opts;

  const redirect_url = `${origin}/visibility-sprint/success?tx_ref=${encodeURIComponent(tx_ref)}`;

  const payload = {
    tx_ref,
    amount: pack.amount,
    currency,
    redirect_url,
    customer: {
      email,
      name,
    },
    customizations: {
      title: "Omniv Visibility Sprint",
      description: `${pack.label} — $${pack.amount} one-time`,
      logo: `${origin}/logo.png`,
    },
    meta: {
      product: "visibility_sprint",
      plan: `visibility_sprint_${pack.id}`,
      package: pack.id,
      order_id: orderId,
      company,
      amount: String(pack.amount),
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
      .eq("id", orderId);
    return NextResponse.json(
      { error: data?.message || "Payment init failed" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    link: data.data.link as string,
    tx_ref,
    order_id: orderId,
    package: pack.id,
    amount: pack.amount,
  });
}
