import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { trackServer } from "@/lib/analytics";

export const runtime = "nodejs";

type Body = {
  opportunityId?: string;
  action?: "done" | "dismiss" | "reopen";
};

/**
 * Mirror opportunity progress server-side so Ziki / ranking can see it
 * across devices (not only localStorage).
 * Soft-fails if profiles.opp_progress column is missing — still logs event.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const opportunityId = (body.opportunityId || "").trim();
    const action = body.action || "done";
    if (!opportunityId) {
      return NextResponse.json(
        { error: "opportunityId required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventName =
      action === "dismiss"
        ? "opp_dismissed"
        : action === "reopen"
          ? "opp_reopen"
          : "opp_done";

    try {
      await trackServer({
        name: eventName,
        userId: user.id,
        path: "/opportunities",
        meta: { opportunity_id: opportunityId },
      });
    } catch {
      /* soft */
    }

    try {
      const { data: row } = await supabase
        .from("profiles")
        .select("opp_progress")
        .eq("id", user.id)
        .maybeSingle();

      const prev = (row?.opp_progress || {}) as {
        completed?: Record<string, number>;
        dismissed?: Record<string, number>;
      };
      const completed = { ...(prev.completed || {}) };
      const dismissed = { ...(prev.dismissed || {}) };
      const now = Date.now();

      if (action === "done") {
        completed[opportunityId] = now;
        delete dismissed[opportunityId];
      } else if (action === "dismiss") {
        dismissed[opportunityId] = now;
      } else {
        delete completed[opportunityId];
        delete dismissed[opportunityId];
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          opp_progress: { completed, dismissed },
        })
        .eq("id", user.id);

      if (error) {
        return NextResponse.json({
          ok: true,
          mirrored: false,
          reason: error.message,
        });
      }

      return NextResponse.json({ ok: true, mirrored: true });
    } catch (e) {
      return NextResponse.json({
        ok: true,
        mirrored: false,
        reason: e instanceof Error ? e.message : "mirror_failed",
      });
    }
  } catch (e) {
    console.error("opp progress", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
