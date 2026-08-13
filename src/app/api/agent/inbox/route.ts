import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AgentProposal } from "@/lib/agent/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/agent/inbox — list proposals for the signed-in user.
 * PATCH /api/agent/inbox — persist status (done | dismissed | pending) server-side
 *   so dismiss/confirm survives localStorage clears and multi-device.
 *   Also supports { clearPending: true } to dismiss all pending.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ pending: 0, proposals: [] });
    }
    const { data } = await supabase
      .from("profiles")
      .select("agent_inbox, agent_scanned_at")
      .eq("id", user.id)
      .maybeSingle();

    const inbox = data?.agent_inbox as
      | {
          proposals?: AgentProposal[];
          narrative?: string;
          scannedAt?: number;
        }
      | null;

    const proposals = Array.isArray(inbox?.proposals) ? inbox!.proposals! : [];
    const pending = proposals.filter(
      (p) => !p.status || p.status === "pending"
    ).length;

    return NextResponse.json({
      pending,
      proposals,
      narrative: inbox?.narrative || "",
      scannedAt: data?.agent_scanned_at || inbox?.scannedAt || null,
    });
  } catch {
    return NextResponse.json({ pending: 0, proposals: [] });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: {
      id?: string;
      status?: "done" | "dismissed" | "pending";
      ids?: { id: string; status: "done" | "dismissed" | "pending" }[];
      clearPending?: boolean;
    };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("agent_inbox")
      .eq("id", user.id)
      .maybeSingle();

    if (pErr) {
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }

    const inbox = (profile?.agent_inbox || {}) as {
      proposals?: AgentProposal[];
      narrative?: string;
      scannedAt?: number;
    };
    const existing = Array.isArray(inbox.proposals) ? inbox.proposals : [];

    if (body.clearPending) {
      const next = existing.map((p) =>
        !p.status || p.status === "pending"
          ? { ...p, status: "dismissed" as const }
          : p
      );
      const pending = next.filter((p) => p.status === "pending");
      const closed = next
        .filter((p) => p.status === "done" || p.status === "dismissed")
        .slice(0, 20);
      const proposals = [...pending, ...closed].slice(0, 40);
      const { error } = await supabase
        .from("profiles")
        .update({
          agent_inbox: {
            proposals,
            scannedAt: inbox.scannedAt || Date.now(),
            narrative: inbox.narrative || "",
          },
        })
        .eq("id", user.id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({
        ok: true,
        cleared: true,
        pending: 0,
      });
    }

    const updates: { id: string; status: "done" | "dismissed" | "pending" }[] =
      Array.isArray(body.ids) && body.ids.length
        ? body.ids.filter(
            (u) =>
              u?.id &&
              (u.status === "done" ||
                u.status === "dismissed" ||
                u.status === "pending")
          )
        : body.id &&
            (body.status === "done" ||
              body.status === "dismissed" ||
              body.status === "pending")
          ? [{ id: body.id, status: body.status }]
          : [];

    if (!updates.length) {
      return NextResponse.json(
        { error: "id + status (or ids[] or clearPending) required" },
        { status: 400 }
      );
    }

    const byStatus = new Map(updates.map((u) => [u.id, u.status]));

    const next = existing.map((p) => {
      const s = byStatus.get(p.id);
      return s ? { ...p, status: s } : p;
    });

    const pending = next.filter((p) => p.status === "pending");
    const closed = next
      .filter((p) => p.status === "done" || p.status === "dismissed")
      .slice(0, 20);
    const proposals = [...pending, ...closed].slice(0, 40);

    const { error } = await supabase
      .from("profiles")
      .update({
        agent_inbox: {
          proposals,
          scannedAt: inbox.scannedAt || Date.now(),
          narrative: inbox.narrative || "",
        },
      })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      updated: updates.length,
      pending: proposals.filter((p) => p.status === "pending").length,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "failed" },
      { status: 500 }
    );
  }
}
