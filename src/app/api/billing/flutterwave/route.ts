import { NextResponse } from "next/server";

/**
 * Flutterwave standard checkout initiation.
 * Requires FLW_SECRET_KEY in Vercel env.
 * Docs: https://developer.flutterwave.com/docs/collecting-payments/standard
 */
export async function POST(req: Request) {
  const secret = process.env.FLW_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      {
        error:
          "Flutterwave not configured. Add FLW_SECRET_KEY in Vercel Environment Variables.",
      },
      { status: 503 }
    );
  }

  try {
    const body = (await req.json()) as {
      plan?: "starter" | "pro" | "label";
      email?: string;
      name?: string;
    };

    const prices: Record<string, number> = {
      starter: 29,
      pro: 59,
      label: 179,
    };
    const plan = body.plan || "starter";
    const amount = prices[plan] ?? 29;
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "https://omniv-cso.vercel.app";

    const payload = {
      tx_ref: `omniv-${plan}-${Date.now()}`,
      amount,
      currency: process.env.FLW_CURRENCY || "USD",
      redirect_url: `${origin}/settings?billing=success`,
      customer: {
        email: body.email || "artist@omniv.app",
        name: body.name || "Omniv Artist",
      },
      customizations: {
        title: "Omniv",
        description: `Omniv ${plan} plan`,
      },
      meta: { plan },
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
    if (!res.ok) {
      console.error("Flutterwave error", data);
      return NextResponse.json(
        { error: data?.message || "Payment init failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      link: data?.data?.link as string | undefined,
      raw: data,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Billing unavailable" }, { status: 500 });
  }
}
