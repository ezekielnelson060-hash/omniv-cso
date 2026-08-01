import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";

/**
 * Flutterwave webhook — upgrades plan ONLY after verified successful charge.
 *
 * Dashboard URL:
 *   https://www.omniv.media/api/billing/flutterwave/webhook
 * Env:
 *   FLW_SECRET_KEY, FLW_SECRET_HASH, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL
 */

const PLAN_IDS = new Set(["starter", "pro", "label"]);

function parseTxRef(txRef: string): { plan: string | null; userId: string | null } {
  // omniv_pro_<uuid>_<ts>
  const m = txRef.match(
    /^omniv_(starter|pro|label)_([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})_/i
  );
  if (m) return { plan: m[1]!.toLowerCase(), userId: m[2]! };
  const planOnly = txRef.match(/^omniv_(starter|pro|label)_/i);
  return { plan: planOnly ? planOnly[1]!.toLowerCase() : null, userId: null };
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
  const secretHash = process.env.FLW_SECRET_HASH;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !service) {
    console.error("Webhook missing Supabase service role");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const rawBody = await req.text();

  // Require hash in production; allow missing only if explicitly disabled for local debug
  if (secretHash) {
    if (!verifySignature(rawBody, req.headers, secretHash)) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    console.error("FLW_SECRET_HASH not set");
    return NextResponse.json({ error: "misconfigured" }, { status: 500 });
  }

  let body: {
    event?: string;
    data?: {
      id?: number;
      tx_ref?: string;
      amount?: number;
      currency?: string;
      status?: string;
      meta?: { plan?: string; user_id?: string };
      customer?: { email?: string };
    };
  };

  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const data = body.data;
  if (!data) return NextResponse.json({ ok: true, ignored: true });

  // Accept charge.completed or successful data.status
  if (body.event && body.event !== "charge.completed") {
    return NextResponse.json({ ok: true, ignored: true });
  }
  if (data.status && data.status !== "successful") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  // Re-verify with Flutterwave API
  let verified = data;
  if (data.id != null) {
    const v = await verifyTransaction(data.id);
    if (!v || v.status !== "successful") {
      return NextResponse.json({ error: "verify failed" }, { status: 400 });
    }
    verified = v;
  }

  const txRef = String(verified.tx_ref || data.tx_ref || "");
  const parsed = parseTxRef(txRef);
  const metaPlan = (verified.meta?.plan || data.meta?.plan || "") as string;
  const planRaw = parsed.plan || metaPlan || "starter";
  const plan = PLAN_IDS.has(planRaw) ? planRaw : "starter";

  let userId =
    parsed.userId ||
    (verified.meta?.user_id as string | undefined) ||
    (data.meta?.user_id as string | undefined) ||
    null;
  const email = (
    (verified.customer?.email as string | undefined) ||
    data.customer?.email ||
    ""
  ).toLowerCase();

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Resolve user by email if tx_ref had no uuid
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

  // Idempotent payment log
  const { error: payErr } = await admin.from("payments").upsert(
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
  if (payErr) console.error("payments upsert", payErr);

  const { error } = await admin
    .from("profiles")
    .update({
      plan,
      plan_status: "active",
      billing_status: "active",
      flw_tx_ref: txRef,
      plan_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("plan update failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, plan, userId });
}
