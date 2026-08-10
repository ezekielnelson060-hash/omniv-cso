import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { AgentProposal } from "@/lib/agent/types";

export const dynamic = "force-dynamic";

/**
 * Infer a useful confirm action from partner payload when actionType omitted.
 * Playlist/curator/sync → DRAFT_OUTREACH; distro live → OPEN_CATALOGUE; etc.
 */
function inferAction(
  title: string,
  bodyText: string,
  explicit?: AgentProposal["action"]["type"]
): {
  type: AgentProposal["action"]["type"];
  label: string;
  payload: Record<string, string>;
} {
  if (explicit) {
    return {
      type: explicit,
      label: "Confirm",
      payload: {
        q: `Inbound signal:\n${title}\n${bodyText}\nTell me the highest-impact next move.`,
      },
    };
  }

  const hay = `${title} ${bodyText}`.toLowerCase();

  if (/playlist|curator|editorial|radio add|added to/.test(hay)) {
    const curator =
      hay.match(/(?:playlist|curator)[:\s]+([a-z0-9 ._-]{2,40})/i)?.[1]?.trim() ||
      "curator";
    return {
      type: "DRAFT_OUTREACH",
      label: "Draft outreach",
      payload: {
        to: curator.slice(0, 60),
        topic: title.slice(0, 80),
        q: `Draft a short thank-you / relationship note for: ${title}`,
      },
    };
  }

  if (/sync|brief|licensing|placement|sync brief/.test(hay)) {
    return {
      type: "OPEN_ZIKI",
      label: "Draft pitch in Ziki",
      payload: {
        q: `Draft a pitch for this sync/brief using my catalogue:\n${title}\n${bodyText}`,
      },
    };
  }

  if (/distro|pre-?save|release live|dsp|isrc/.test(hay)) {
    return {
      type: "OPEN_CATALOGUE",
      label: "Open catalogue · ship plan",
      payload: {
        phase: /pre-?save/.test(hay) ? "presave" : "live",
      },
    };
  }

  if (/city|room|gathering|drop party|fan city/.test(hay)) {
    return {
      type: "CREATE_ROOM",
      label: "Draft room",
      payload: {
        title: title.slice(0, 80),
        city:
          hay.match(/\b(lagos|accra|nairobi|london|nyc|atlanta)\b/i)?.[1] || "",
      },
    };
  }

  return {
    type: "OPEN_ZIKI",
    label: "Review in Ziki",
    payload: {
      q: `Inbound signal:\n${title}\n${bodyText}\nTell me the highest-impact next move.`,
    },
  };
}

/**
 * POST /api/agent/webhook
 * Third-party or internal signals → agent_inbox proposals.
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

  const bodyText = (body.body || "").trim();
  const inferred = inferAction(title, bodyText, body.actionType);
  const actionType = body.actionType || inferred.type;
  const actionLabel =
    body.actionLabel ||
    (actionType === "DRAFT_OUTREACH"
      ? "Draft outreach"
      : actionType === "CREATE_ROOM"
        ? "Draft room"
        : actionType === "OPEN_CATALOGUE"
          ? "Open catalogue"
          : inferred.label);
  const payload = {
    ...inferred.payload,
    ...(body.payload || {}),
  };

  const proposal: AgentProposal = {
    id: externalId ? `wh-${externalId}` : `wh-${Date.now()}`,
    title,
    body: bodyText || title,
    urgency: body.urgency || "today",
    impact: body.impact || "medium",
    source: "webhook",
    action: {
      type: actionType,
      label: actionLabel,
      payload,
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

  return NextResponse.json({
    ok: true,
    proposalId: proposal.id,
    actionType: proposal.action.type,
  });
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
    inferredActions: [
      "playlist/curator → DRAFT_OUTREACH",
      "sync/brief → OPEN_ZIKI",
      "distro/presave/live → OPEN_CATALOGUE",
      "city/room → CREATE_ROOM",
    ],
  });
}
