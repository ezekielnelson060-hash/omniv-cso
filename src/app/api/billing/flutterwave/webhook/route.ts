import { NextResponse } from "next/server";
import { pushAgentProposal } from "@/lib/agent/push-proposal";
import type { AgentProposal } from "@/lib/agent/types";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { trackServer } from "@/lib/analytics";

export const runtime = "nodejs";

const PLAN_IDS = new Set(["starter", "pro", "label"]);

function parseTxRef(txRef: string): { plan: string | null; userId: string | null } {
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
  const secretHash = process.env.FLW_SECRET_HASH || process.env.FLW_SECRET_KEY;
  const rawBody = await req.text();

  if (secretHash && !verifySignature(rawBody, req.headers, secretHash)) {
    // Still accept if FLW_SECRET_HASH not set (dev) — verify transaction below
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
    return NextResponse.json({ error: "supabase missing" }, { status: 503 });
  }

  if (body.event && body.event !== "charge.completed") {
    return NextResponse.json({ ok: true, ignored: true });
  }
  if (data.status && data.status !== "successful") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  let verified = data;
  if (data.id != null) {
    const v = await verifyTransaction(data.id as string | number);
    if (!v || v.status !== "successful") {
      return NextResponse.json({ error: "verify failed" }, { status: 400 });
    }
    verified = v;
  }

  const txRef = String(verified.tx_ref || data.tx_ref || "");
  const meta = (verified.meta || data.meta || {}) as {
    plan?: string;
    user_id?: string;
    type?: string;
    gathering_id?: string;
    email?: string;
    is_tip?: boolean;
  };

  // Gathering ticket — confirm RSVP, do not change SaaS plan
  if (meta.type === "gathering" || txRef.startsWith("omniv_gath_")) {
    const adminG = createClient(url, service, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const fanEmail = (
      (verified.customer as { email?: string } | undefined)?.email ||
      (data.customer as { email?: string } | undefined)?.email ||
      meta.email ||
      ""
    ).toLowerCase();
    const gid = meta.gathering_id || null;
    if (gid && fanEmail) {
      await adminG.from("gathering_rsvps").upsert(
        {
          gathering_id: gid,
          email: fanEmail,
          status: "going",
        },
        { onConflict: "gathering_id,email" }
      );
      await adminG.from("payments").upsert(
        {
          provider: "flutterwave",
          provider_payment_id: String(verified.id ?? data.id ?? txRef),
          user_id: null,
          email: fanEmail,
          plan: "gathering",
          amount: Number(verified.amount ?? data.amount ?? 0),
          currency: String(verified.currency ?? data.currency ?? "USD"),
          status: "successful",
          tx_ref: txRef,
          raw: verified,
        },
        { onConflict: "provider,provider_payment_id" }
      );

      try {
        const { data: gRow } = await adminG
          .from("gatherings")
          .select("user_id, title, city")
          .eq("id", gid)
          .maybeSingle();
        if (gRow?.user_id) {
          const amt = Number(verified.amount ?? data.amount ?? 0);
          const cur = String(verified.currency ?? data.currency ?? "USD");
          const isTip = Boolean(meta.is_tip) || /tip/i.test(txRef);
          const now = Date.now();
          const proposal: AgentProposal = {
            id: `room-pay-${txRef}`.slice(0, 80),
            title: isTip
              ? `Tip received · ${cur} ${amt}`
              : `Paid RSVP · ${cur} ${amt}`,
            body: `${fanEmail} paid for “${gRow.title}”${gRow.city ? ` (${gRow.city})` : ""}. Confirm in Command Center → earnings.`,
            urgency: "now",
            impact: "high",
            source: "audience",
            action: {
              type: "OPEN_CRM",
              label: "Open Command Center",
              payload: {},
            },
            status: "pending",
            createdAt: now,
          };
          await pushAgentProposal(adminG, String(gRow.user_id), proposal);
        }
      } catch (e) {
        console.error("agent pay notify", e);
      }
    }
    return NextResponse.json({ ok: true, type: "gathering" });
  }

  const parsed = parseTxRef(txRef);
  const metaPlan = (meta.plan || "") as string;
  const planRaw = parsed.plan || metaPlan || "starter";
  const plan = PLAN_IDS.has(planRaw) ? planRaw : "starter";

  let userId = parsed.userId || meta.user_id || null;
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

  try {
    await trackServer("payment_success", { plan, amount, currency }, userId);
  } catch {
    /* ignore */
  }

  return NextResponse.json({ ok: true, plan, userId });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    path: "/api/billing/flutterwave/webhook",
  });
}
