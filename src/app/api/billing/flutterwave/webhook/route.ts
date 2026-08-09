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

  const gatheringId =
    (meta.gathering_id as string) ||
    (meta.gatheringId as string) ||
    (txRef.match(/^gath[_-]([a-f0-9-]+)/i)?.[1] ?? null);

  if (gatheringId || /tip/i.test(txRef) || meta.is_tip) {
    const adminG = createClient(url, service, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    if (gatheringId) {
      try {
        const { data: gRow } = await adminG
          .from("gatherings")
          .select("id, user_id, title, city")
          .eq("id", gatheringId)
          .maybeSingle();
        if (gRow?.user_id) {
          const fanEmail =
            (
              (verified.customer as { email?: string } | undefined)?.email ||
              (data.customer as { email?: string } | undefined)?.email ||
              "A fan"
            ).toString();
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

  try {
    await trackServer({
      name: "payment_success",
      userId,
      meta: { plan, amount, currency },
    });
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
