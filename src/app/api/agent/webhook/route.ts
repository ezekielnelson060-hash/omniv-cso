import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { AgentProposal } from "@/lib/agent/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/agent/webhook
 * Third-party or internal signals → agent_inbox proposals.
 *
 * Headers:
 *   Authorization: Bearer <AGENT_WEBHOOK_SECRET>
 *   or x-omniv-webhook-secret: <AGENT_WEBHOOK_SECRET>
 *
 * Body: { userId, title, body?, urgency?, impact?, actionType?, actionLabel?, payload?, externalId? }
 */
export async function POST(req: Request) {
  const secret = process.env.AGENT_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "AGENT_WEBHOOK_SECRET not configured" },
      { status: 503 }
    );
  }

  const auth =
    req.headers.get("authorization") ||
    req.headers.get("x-omniv-webhook-secret") ||
    "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  let body: {
    userId?: string;
    title?: string;
    body?: string;
    urgency?: "now" | "today" | "this_week";
    impact?: "high" | "medium" | "low";
    actionType?: AgentProposal["action"]["type"];
    actionLabel?: string;
    payload?: Record<string, string>;
    externalId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const userId = (body.userId || "").trim();
  const title = (body.title || "").trim();
  if (!userId || !title) {
    return NextResponse.json(
      { error: "userId and title required" },
      { status: 400 }
    );
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const { data: profile, error: pErr } = await admin
    .from("profiles")
    .select("id, agent_inbox")
    .eq("id", userId)
    .maybeSingle();

  if (pErr || !profile) {
    return NextResponse.json({ error: "user not found" }, { status: 404 });
  }

  const inbox = (profile.agent_inbox || {}) as {
    proposals?: AgentProposal[];
    scannedAt?: number;
    narrative?: string;
  };
  const existing = Array.isArray(inbox.proposals) ? inbox.proposals : [];

  const externalId = (body.externalId || "").trim();
  if (externalId && existing.some((p) => p.id === `wh-${externalId}`)) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  const proposal: AgentProposal = {
    id: externalId ? `wh-${externalId}` : `wh-${Date.now()}`,
    title,
    body: (body.body || "").trim() || title,
    urgency: body.urgency || "today",
    impact: body.impact || "medium",
    source: "webhook",
    action: {
      type: body.actionType || "OPEN_ZIKI",
      label: body.actionLabel || "Review in Ziki",
      payload: body.payload || {
        q: `Inbound signal:\n${title}\n${body.body || ""}\nTell me the highest-impact next move.`,
      },
    },
    status: "pending",
    createdAt: Date.now(),
  };

  const proposals = [
    proposal,
    ...existing.filter((p) => p.status === "pending"),
  ].slice(0, 40);

  const { error } = await admin
    .from("profiles")
    .update({
      agent_inbox: {
        proposals,
        scannedAt: Date.now(),
        narrative:
          inbox.narrative ||
          "External signal received. Confirm or dismiss in Agent.",
      },
    })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, proposalId: proposal.id });
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/agent/webhook",
    auth: "Bearer AGENT_WEBHOOK_SECRET or x-omniv-webhook-secret",
    required: ["userId", "title"],
    optional: [
      "body",
      "urgency",
      "impact",
      "actionType",
      "actionLabel",
      "payload",
      "externalId",
    ],
  });
}
