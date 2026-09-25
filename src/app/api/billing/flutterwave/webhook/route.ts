import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";

const PLAN_IDS = new Set(["starter", "pro", "business", "label"]);

function parseTxRef(txRef: string): {
  plan: string | null;
  userId: string | null;
} {
  const m = txRef.match(
    /^omniv_(starter|pro|business|label)_([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})_/i
  );
  if (m) return { plan: m[1]!.toLowerCase(), userId: m[2]! };
  const planOnly = txRef.match(/^omniv_(starter|pro|business|label)_/i);
  return { plan: planOnly ? planOnly[1]!.toLowerCase() : null, userId: null };
}

function normalizePlan(plan: string): string {
  if (plan === "starter") return "pro";
  if (plan === "label") return "business";
  return plan;
}

function verifySignature(
  rawBody: string,
  headers: Headers,
  secretHash: string
): boolean {
  const verifHash = headers.get("verif-hash");
  if (verifHash && verifHash === secretHash) return true;

  const flwSig = headers.get("flutterwave-signature");
  if (flwSig) {
    const hash = crypto
      .createHmac("sha256", secretHash)
      .update(rawBody)
      .digest("base64");
    if (hash === flwSig) return true;
  }
  return false;
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
  return json?.data ?? null;
}

export async function POST(req: Request) {
  const secretHash = process.env.FLW_SECRET_HASH || process.env.FLW_SECRET_KEY;
  const rawBody = await req.text();

  if (secretHash && !verifySignature(rawBody, req.headers, secretHash)) {
    if (process.env.FLW_SECRET_HASH) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  }

  let body: {
    event?: string;
    data?: Record<string, unknown>;
  };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const data = (body.data || {}) as Record<string, unknown>;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    return NextResponse.json({ error: "server misconfigured" }, { status: 500 });
  }

  const status = String(data.status || "").toLowerCase();
  if (status && status !== "successful" && status !== "success") {
    return NextResponse.json({ ok: true, skipped: "not_successful" });
  }

  const txId = data.id as number | string | undefined;
  const txRef = String(data.tx_ref || data.txRef || "");
  const meta = (data.meta || {}) as Record<string, unknown>;

  let verified: Record<string, unknown> = data;
  if (txId != null) {
    const v = await verifyTransaction(txId);
    if (v) verified = v as Record<string, unknown>;
  }

  // Skip legacy gathering tips if present
  if (meta.gathering_id || /tip/i.test(txRef) || meta.is_tip) {
    return NextResponse.json({ ok: true, type: "gathering_skipped" });
  }

  const parsed = parseTxRef(txRef);
  const metaPlan = (meta.plan || "") as string;
  const planRaw = parsed.plan || metaPlan || "pro";
  const plan = normalizePlan(
    PLAN_IDS.has(planRaw) ? planRaw : "pro"
  );

  let userId = parsed.userId || (meta.user_id as string) || null;
  const email = (
    (verified.customer as { email?: string } | undefined)?.email ||
    (data.customer as { email?: string } | undefined)?.email ||
    ""
  ).toLowerCase();

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (!userId && email) {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    userId = profile?.id ?? null;
  }

  if (!userId) {
    console.error("Webhook: cannot map user", { txRef, email, plan });
    return NextResponse.json({ error: "unmapped user" }, { status: 422 });
  }

  const flwId = String(verified.id ?? data.id ?? txRef);
  const amount = Number(verified.amount ?? data.amount ?? 0);
  const currency = String(verified.currency ?? data.currency ?? "USD");

  await admin.from("payments").upsert(
    {
      provider: "flutterwave",
      provider_payment_id: flwId,
      user_id: userId,
      email: email || null,
      plan,
      amount,
      currency,
      status: "successful",
      tx_ref: txRef,
      raw: verified,
    },
    { onConflict: "provider,provider_payment_id" }
  );

  await admin
    .from("profiles")
    .update({
      plan,
      plan_status: "active",
      billing_status: "active",
      plan_updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  // Pro / Business → verify all discovery entities owned by this user
  if (plan === "pro" || plan === "business") {
    try {
      await admin
        .from("discovery_entities")
        .update({ verified: true })
        .eq("owner_id", userId);
    } catch (e) {
      console.error("verify entities after pay", e);
    }
  }

  return NextResponse.json({ ok: true, plan, userId, verified: true });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    path: "/api/billing/flutterwave/webhook",
  });
}
