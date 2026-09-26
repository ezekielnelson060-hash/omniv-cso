import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const PAYMENT_PLANS = new Set(["starter", "pro", "business", "label", "promote"]);
const PLAN_AMOUNTS: Record<string, number> = { starter: 29, pro: 29, business: 99, label: 99 };

function parseTxRef(txRef: string) {
  const m = txRef.match(/^omniv_(starter|pro|business|label|promote)_([0-9a-f-]{36})_/i);
  if (m) return { plan: m[1]!.toLowerCase(), userId: m[2]! };
  const p = txRef.match(/^omniv_(starter|pro|business|label|promote)_/i);
  return { plan: p?.[1]?.toLowerCase() ?? null, userId: null };
}

function normalizePlan(plan: string) {
  if (plan === "starter") return "pro";
  if (plan === "label") return "business";
  return plan;
}

async function verifyTransaction(id: number | string) {
  const secret = process.env.FLW_SECRET_KEY;
  if (!secret) return null;
  const res = await fetch(`https://api.flutterwave.com/v3/transactions/${id}/verify`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data ?? null;
}

function nextMonth(from: Date) {
  const result = new Date(from);
  result.setUTCMonth(result.getUTCMonth() + 1);
  return result.toISOString();
}

export async function POST(req: Request) {
  const secretHash = process.env.FLW_SECRET_HASH;
  if (!secretHash) {
    console.error("Flutterwave webhook disabled: FLW_SECRET_HASH is missing");
    return NextResponse.json({ error: "webhook misconfigured" }, { status: 503 });
  }
  const signature = req.headers.get("verif-hash");
  if (!signature || signature !== secretHash) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let body: { data?: Record<string, unknown> };
  try {
    body = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const data = (body.data || {}) as Record<string, unknown>;
  const status = String(data.status || "").toLowerCase();
  if (status && status !== "successful" && status !== "success") {
    return NextResponse.json({ ok: true, skipped: "not_successful" });
  }

  const eventTxRef = String(data.tx_ref || data.txRef || "");
  const eventMeta = (data.meta || {}) as Record<string, unknown>;
  const txId = data.id as number | string | undefined;
  let verified: Record<string, unknown> = data;
  if (txId != null) {
    const transaction = await verifyTransaction(txId);
    if (!transaction) return NextResponse.json({ error: "transaction verification failed" }, { status: 422 });
    verified = transaction as Record<string, unknown>;
  }

  const verifiedTxRef = String(verified.tx_ref || verified.txRef || eventTxRef);
  if (!verifiedTxRef || (eventTxRef && verifiedTxRef !== eventTxRef)) {
    return NextResponse.json({ error: "transaction reference mismatch" }, { status: 422 });
  }
  if (/tip/i.test(verifiedTxRef) || eventMeta.gathering_id || eventMeta.is_tip) {
    return NextResponse.json({ ok: true, type: "gathering_skipped" });
  }

  const parsed = parseTxRef(verifiedTxRef);
  const verifiedMeta = verified.meta && typeof verified.meta === "object"
    ? (verified.meta as Record<string, unknown>)
    : eventMeta;
  const rawPlan = (parsed.plan || String(verifiedMeta.plan || "")).toLowerCase();
  if (!PAYMENT_PLANS.has(rawPlan)) {
    return NextResponse.json({ error: "unknown payment plan" }, { status: 422 });
  }
  const plan = normalizePlan(rawPlan);
  const expectedAmount = Number(verifiedMeta.amount || PLAN_AMOUNTS[rawPlan] || 0);
  const amount = Number(verified.amount ?? data.amount ?? 0);
  const expectedCurrency = String(
    verifiedMeta.currency || process.env.FLW_CURRENCY || "USD"
  ).toUpperCase();
  const currency = String(verified.currency ?? data.currency ?? "USD").toUpperCase();
  if (!expectedAmount || !amount || Math.abs(amount - expectedAmount) > 0.01) {
    return NextResponse.json({ error: "transaction amount mismatch" }, { status: 422 });
  }
  if (currency !== expectedCurrency) {
    return NextResponse.json({ error: "transaction currency mismatch" }, { status: 422 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return NextResponse.json({ error: "server misconfigured" }, { status: 500 });

  let userId = parsed.userId || String(verifiedMeta.user_id || "") || null;
  const email = (
    (verified.customer as { email?: string } | undefined)?.email ||
    (data.customer as { email?: string } | undefined)?.email || ""
  ).toLowerCase();
  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  if (!userId && email) {
    const { data: profile } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
    userId = profile?.id ?? null;
  }
  if (!userId) return NextResponse.json({ error: "unmapped user" }, { status: 422 });

  const providerPaymentId = String(verified.id ?? data.id ?? verifiedTxRef);
  const { error: paymentError } = await admin.from("payments").upsert(
    {
      provider: "flutterwave",
      provider_payment_id: providerPaymentId,
      user_id: userId,
      email: email || null,
      plan,
      amount,
      currency,
      status: "successful",
      tx_ref: verifiedTxRef,
      raw: verified,
    },
    { onConflict: "provider,provider_payment_id" }
  );
  if (paymentError) return NextResponse.json({ error: "payment record failed" }, { status: 500 });

  // Promotion purchases are recorded but never grant a membership plan.
  if (rawPlan === "promote") {
    return NextResponse.json({ ok: true, plan: "promote", userId, promotion: true });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("plan_expires_at")
    .eq("id", userId)
    .maybeSingle();
  const existingExpiry = profile?.plan_expires_at ? new Date(profile.plan_expires_at) : new Date();
  const start = existingExpiry.getTime() > Date.now() ? existingExpiry : new Date();
  const planExpiresAt = nextMonth(start);
  const { error: profileError } = await admin.from("profiles").update({
    plan,
    plan_status: "active",
    billing_status: "active",
    plan_updated_at: new Date().toISOString(),
    plan_expires_at: planExpiresAt,
  }).eq("id", userId);
  if (profileError) return NextResponse.json({ error: "entitlement update failed" }, { status: 500 });

  if (plan === "pro" || plan === "business") {
    const { error } = await admin.from("discovery_entities").update({ verified: true }).eq("owner_id", userId);
    if (error) console.error("verify entities after pay", error);
  }
  return NextResponse.json({ ok: true, plan, userId, planExpiresAt, verified: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, path: "/api/billing/flutterwave/webhook" });
}
