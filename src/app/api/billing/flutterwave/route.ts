import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  DISCOVERY_PLANS,
  LEGACY_CHECKOUT_AMOUNTS,
  PROMOTION_CONFIG,
} from "@/lib/discovery/monetization";

/**
 * Flutterwave standard checkout.
 * Plans: discovery Pro (central config), legacy business, and promotion budget.
 * Requires FLW_SECRET_KEY. Optional: FLW_CURRENCY (default USD).
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
      plan?: "starter" | "pro" | "business" | "label" | "promote";
      amount?: number;
      email?: string;
      name?: string;
      meta?: Record<string, string>;
    };

    const prices: Record<string, number> = {
      starter: DISCOVERY_PLANS.pro.priceMonthlyUsd,
      pro: DISCOVERY_PLANS.pro.priceMonthlyUsd,
      business: LEGACY_CHECKOUT_AMOUNTS.business,
      label: LEGACY_CHECKOUT_AMOUNTS.label,
      promote: PROMOTION_CONFIG.defaultBudgetUsd,
    };
    let plan = body.plan || "pro";
    if (plan === "starter") plan = "pro";
    if (plan === "label") plan = "business";

    let amount = prices[plan] ?? 29;
    if (plan === "promote" && typeof body.amount === "number") {
      amount = Math.min(
        PROMOTION_CONFIG.maxBudgetUsd,
        Math.max(PROMOTION_CONFIG.minBudgetUsd, Math.round(body.amount))
      );
    }

    let userId: string | null = null;
    let email = body.email || "";
    let name = body.name || "Omniv Publisher";

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        email = email || user.email || "";
        name =
          name ||
          (user.user_metadata?.full_name as string | undefined) ||
          "Omniv Publisher";
      }
    } catch {
      /* unauthenticated checkout with email still allowed */
    }

    if (!email) {
      return NextResponse.json(
        { error: "Sign in or provide an email to checkout." },
        { status: 400 }
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "https://omniv.media";

    const redirect =
      plan === "promote"
        ? `${origin}/promote?billing=success`
        : `${origin}/pro?billing=success&plan=${plan}`;

    const tx_ref = userId
      ? `omniv_${plan}_${userId}_${Date.now()}`
      : `omniv_${plan}_anon_${Date.now()}`;

    const payload = {
      tx_ref,
      amount,
      currency: process.env.FLW_CURRENCY || "USD",
      redirect_url: redirect,
      customer: {
        email,
        name,
      },
      customizations: {
        title: "Omniv",
        description:
          plan === "promote"
            ? `Promote publication — $${amount}`
            : plan === "business"
              ? "Omniv Business — verified + team tools"
              : "Omniv Pro — verified publisher",
        logo: `${origin}/logo.svg`,
      },
      meta: {
        ...(body.meta || {}),
        plan,
        amount: String(amount),
        currency: process.env.FLW_CURRENCY || "USD",
        user_id: userId || "",
        product: plan === "promote" ? "promote" : "discovery",
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
    if (!res.ok) {
      console.error("Flutterwave error", data);
      return NextResponse.json(
        { error: data?.message || "Payment init failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      link: data?.data?.link as string | undefined,
      tx_ref,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Billing unavailable" }, { status: 500 });
  }
}
