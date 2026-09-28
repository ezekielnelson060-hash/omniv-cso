import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const PLAN_AMOUNTS: Record<string, number> = {
  pro: 29,
  business: 99,
  verify: 9,
};

function parseTxRef(txRef: string) {
  // omniv_{plan}_{userId}_{ts} or omniv_{plan}_anon_{ts}
  const parts = txRef.split("_");
  if (parts[0] !== "omniv" || parts.length < 3) {
    return { plan: "", userId: null as string | null };
  }
  const plan = parts[1] || "";
  const userId = parts[2] === "anon" ? null : parts[2] || null;
  return { plan, userId };
}

async function verifyTransaction(id: number | string) {
  const secret = process.env.FLW_SECRET_KEY;
  if (!secret) return null;
  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/${id}/verify`,
    { headers: { Authorization: `Bearer ${secret}` } }
  );
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data || null;
}

export async function POST(req: Request) {
  const secret = process.env.FLW_SECRET_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !url || !service) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = (body.data as Record<string, unknown>) || body;
  const eventTxRef = String(
    data.tx_ref || data.txRef || body.tx_ref || ""
  );
  const txId = data.id || body.id;
  const eventMeta =
    data.meta && typeof data.meta === "object"
      ? (data.meta as Record<string, unknown>)
      : {};

  let verified: Record<string, unknown> = data;
  if (txId) {
    const transaction = await verifyTransaction(txId as string | number);
    if (transaction) {
      verified = transaction as Record<string, unknown>;
    }
  }

  const verifiedTxRef = String(verified.tx_ref || verified.txRef || eventTxRef);
  if (!verifiedTxRef || (eventTxRef && verifiedTxRef !== eventTxRef)) {
    return NextResponse.json({ error: "tx_ref mismatch" }, { status: 400 });
  }

  if (/tip/i.test(verifiedTxRef) || eventMeta.gathering_id || eventMeta.is_tip) {
    return NextResponse.json({ ok: true, skipped: "tip" });
  }

  const parsed = parseTxRef(verifiedTxRef);
  const verifiedMeta =
    verified.meta && typeof verified.meta === "object"
      ? (verified.meta as Record<string, unknown>)
      : {};
  const rawPlan = (parsed.plan || String(verifiedMeta.plan || "")).toLowerCase();
  let plan = rawPlan;
  if (plan === "starter") plan = "pro";
  if (plan === "label") plan = "business";

  const expectedAmount = Number(
    verifiedMeta.amount || PLAN_AMOUNTS[rawPlan] || 0
  );
  const amount = Number(verified.amount ?? data.amount ?? 0);
  const expectedCurrency = String(
    verifiedMeta.currency || process.env.FLW_CURRENCY || "USD"
  ).toUpperCase();
  const currency = String(
    verified.currency ?? data.currency ?? "USD"
  ).toUpperCase();

  let userId =
    parsed.userId || String(verifiedMeta.user_id || "") || null;
  const email =
    (verified.customer as { email?: string } | undefined)?.email ||
    String(verifiedMeta.email || "") ||
    "";

  const admin = createClient(url, service, {
    auth: { persistSession: false },
  });

  if (!userId && email) {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (profile?.id) userId = profile.id;
  }

  const providerPaymentId = String(verified.id ?? data.id ?? verifiedTxRef);
  const status = String(verified.status || data.status || "").toLowerCase();
  if (status && status !== "successful" && status !== "success") {
    return NextResponse.json({ ok: true, ignored: status });
  }

  const { data: paymentRow, error: paymentError } = await admin
    .from("payments")
    .upsert(
      {
        amount,
        currency,
        status: "successful",
        user_id: userId,
        plan,
        tx_ref: verifiedTxRef,
        raw: verified,
        email,
        provider_payment_id: providerPaymentId,
      },
      { onConflict: "tx_ref" }
    )
    .select("id")
    .maybeSingle();
  if (paymentError) {
    console.error("payment upsert", paymentError);
  }

  if (rawPlan === "promote" || plan === "promote") {
    const promotionId = String(verifiedMeta.promotion_id || "").trim();
    if (promotionId) {
      const durationDays = Number(verifiedMeta.duration || 7);
      const ends = new Date();
      ends.setDate(ends.getDate() + durationDays);
      const { error: promotionError } = await admin
        .from("discovery_promotions")
        .update({
          status: "active",
          ends_at: ends.toISOString(),
          payment_ref: verifiedTxRef,
        })
        .eq("id", promotionId);
      if (promotionError) console.error("promotion activate", promotionError);
    }
    return NextResponse.json({ ok: true, plan: "promote" });
  }

  // Verification application fee — mark paid only; badge after admin approve
  if (rawPlan === "verify" || plan === "verify") {
    const requestId = String(
      verifiedMeta.verification_request_id || verifiedMeta.request_id || ""
    ).trim();
    if (requestId) {
      await admin
        .from("discovery_verification_requests")
        .update({
          paid: true,
          payment_ref: verifiedTxRef,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);
    }
    return NextResponse.json({ ok: true, plan: "verify", paid: true, userId });
  }

  if (!userId) {
    return NextResponse.json({ ok: true, warning: "no user" });
  }

  const planExpiresAt = new Date();
  planExpiresAt.setMonth(planExpiresAt.getMonth() + 1);

  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      plan,
      plan_status: "active",
      billing_status: "active",
      plan_updated_at: new Date().toISOString(),
      plan_expires_at: planExpiresAt.toISOString(),
    })
    .eq("id", userId);
  if (profileError)
    return NextResponse.json(
      { error: "entitlement update failed" },
      { status: 500 }
    );

  if (plan === "pro" || plan === "business") {
    const entityId = String(verifiedMeta.entity_id || "").trim();
    if (entityId) {
      const { data: entity } = await admin
        .from("discovery_entities")
        .select("id")
        .eq("id", entityId)
        .eq("owner_id", userId)
        .maybeSingle();
      if (entity?.id) {
        const { error } = await admin
          .from("discovery_entities")
          .update({ verified: true })
          .eq("id", entity.id)
          .eq("owner_id", userId);
        if (error) console.error("verify selected entity after pay", error);
      } else {
        console.warn("paid verification entity not owned by payer", {
          entityId,
          userId,
        });
      }
    } else {
      console.warn("paid plan had no entity_id; no entity was verified", {
        userId,
        plan,
      });
    }
  }
  return NextResponse.json({
    ok: true,
    plan,
    userId,
    planExpiresAt: planExpiresAt.toISOString(),
    verified: true,
    paymentId: paymentRow?.id,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    path: "/api/billing/flutterwave/webhook",
  });
}
