import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { pushAgentProposal } from "@/lib/agent/push-proposal";
import type { AgentProposal } from "@/lib/agent/types";

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(ctx.params);
  const sb = admin();
  if (!sb) return NextResponse.json({ messages: [] });
  const { data } = await sb
    .from("room_messages")
    .select("id, display_name, body, kind, created_at")
    .eq("gathering_id", id)
    .order("created_at", { ascending: true })
    .limit(100);
  return NextResponse.json({ messages: data || [] });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(ctx.params);
  const sb = admin();
  if (!sb) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }
  const body = (await req.json()) as {
    displayName?: string;
    text?: string;
    kind?: string;
  };
  const name = (body.displayName || "Guest").trim().slice(0, 40) || "Guest";
  const text = (body.text || "").trim().slice(0, 280);
  const kind = ["chat", "tip", "system", "reaction", "join"].includes(
    body.kind || ""
  )
    ? body.kind!
    : "chat";
  if (!text) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const { data: g } = await sb
    .from("gatherings")
    .select("id, status, title, city, user_id")
    .eq("id", id)
    .maybeSingle();
  if (!g || g.status === "cancelled") {
    return NextResponse.json({ error: "room closed" }, { status: 404 });
  }

  const { data, error } = await sb
    .from("room_messages")
    .insert({
      gathering_id: id,
      display_name: name,
      body: text,
      kind,
    })
    .select("id, display_name, body, kind, created_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // One Agent card for join or tip only — never for chat lines
  if ((kind === "join" || kind === "tip") && g.user_id) {
    try {
      const now = Date.now();
      const isTip = kind === "tip";
      const proposal: AgentProposal = {
        id: isTip
          ? `room-tip-${id}-${now}`
          : `room-join-${id}-${name.toLowerCase().replace(/\s+/g, "-").slice(0, 24)}-${Math.floor(now / 60000)}`,
        title: isTip
          ? `Tip in “${g.title}”`
          : `${name} joined “${g.title}”`,
        body: isTip
          ? `${name}: ${text}. Open Command Center → earnings / room to follow up.`
          : `${name} is in the room${g.city ? ` (${g.city})` : ""}. Reply in the room or invite their city list next.`,
        urgency: "now",
        impact: isTip ? "high" : "medium",
        source: "audience",
        action: {
          type: "OPEN_CRM",
          label: "Open Command Center",
          payload: {},
        },
        status: "pending",
        createdAt: now,
      };
      await pushAgentProposal(sb, String(g.user_id), proposal);
    } catch (e) {
      console.error("agent join/tip notify", e);
    }
  }

  return NextResponse.json({ message: data });
}
