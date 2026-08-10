import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AgentActionType } from "@/lib/agent/types";
import { trackServer } from "@/lib/analytics";

export const runtime = "nodejs";

/**
 * Confirm chips land here for side-effects that need the server.
 * Navigation-only types still return ok so the client can route.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      type?: AgentActionType;
      payload?: Record<string, string>;
      title?: string;
    };
    if (!body.type) {
      return NextResponse.json({ error: "type required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const type = body.type;
    const payload = body.payload || {};

    async function log(meta: Record<string, unknown>) {
      try {
        await trackServer({
          name: "agent_execute",
          userId: user!.id,
          path: "/notifications",
          meta: { type, ...meta },
        });
      } catch {
        /* soft */
      }
    }

    if (type === "CREATE_TASK") {
      const title =
        body.title ||
        payload.title ||
        payload.q?.slice(0, 120) ||
        "Agent task";
      const { data, error } = await supabase
        .from("execution_tasks")
        .insert({
          user_id: user.id,
          title: title.slice(0, 200),
          source: "agent",
          done: false,
        })
        .select("id")
        .maybeSingle();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      await log({ taskId: data?.id });
      return NextResponse.json({
        ok: true,
        taskId: data?.id,
        message: `Task created: ${title.slice(0, 80)}`,
        route: "/crm",
      });
    }

    if (type === "CREATE_ROOM") {
      const city = (payload.city || "").trim();
      const title =
        (body.title || payload.title || "").trim() ||
        (city ? `Room · ${city}` : "Drop party");
      const { data, error } = await supabase
        .from("gatherings")
        .insert({
          user_id: user.id,
          title: title.slice(0, 120),
          city: city || null,
          status: "draft",
          room_type: payload.room_type || "drop_party",
        })
        .select("id")
        .maybeSingle();
      if (error) {
        const { data: d2, error: e2 } = await supabase
          .from("gatherings")
          .insert({
            user_id: user.id,
            title: title.slice(0, 120),
            city: city || null,
          })
          .select("id")
          .maybeSingle();
        if (e2) {
          return NextResponse.json({ error: e2.message }, { status: 500 });
        }
        await log({ gatheringId: d2?.id });
        return NextResponse.json({
          ok: true,
          gatheringId: d2?.id,
          message: `Room drafted: ${title.slice(0, 60)}`,
          route: d2?.id ? `/g/${d2.id}` : "/crm",
        });
      }
      await log({ gatheringId: data?.id });
      return NextResponse.json({
        ok: true,
        gatheringId: data?.id,
        message: `Room drafted: ${title.slice(0, 60)}`,
        route: data?.id ? `/g/${data.id}` : "/crm",
      });
    }

    if (type === "DRAFT_OUTREACH") {
      const who = payload.to || payload.curator || payload.name || "contact";
      const topic =
        payload.topic || payload.track || body.title || "your release";
      const draft =
        payload.draft ||
        `Hi ${who},\n\nI'm reaching out about ${topic}. Happy to share a private link + one-liner on why it fits your lane.\n\nBest`;
      const title = `Outreach · ${who}`.slice(0, 200);
      const { data, error } = await supabase
        .from("execution_tasks")
        .insert({
          user_id: user.id,
          title,
          source: "agent",
          done: false,
        })
        .select("id")
        .maybeSingle();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      await log({ taskId: data?.id, outreach: true });
      return NextResponse.json({
        ok: true,
        taskId: data?.id,
        draft,
        message: "Outreach draft saved as a task — open Ziki to refine.",
        route: "/ziki",
        stash: {
          title: `Outreach to ${who}`,
          summary: draft.slice(0, 280),
          why: "Agent confirmed outreach draft",
          expectedOutcome: "Send a personal note that earns a reply",
          category: "outreach",
        },
      });
    }

    if (type === "REFRESH_METRICS") {
      try {
        const base =
          process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "";
        const origin = base
          ? base.startsWith("http")
            ? base
            : `https://${base}`
          : new URL(req.url).origin;
        const res = await fetch(`${origin}/api/platform-metrics/refresh`, {
          method: "POST",
          headers: {
            cookie: req.headers.get("cookie") || "",
          },
        });
        const json = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          updated?: number;
        };
        await log({ refreshed: true, status: res.status });
        return NextResponse.json({
          ok: res.ok,
          message: res.ok
            ? `DSP metrics refreshed${json.updated != null ? ` (${json.updated})` : ""}`
            : "Refresh attempted — check Spotify links in Settings",
          route: "/analytics",
        });
      } catch {
        await log({ refreshed: false });
        return NextResponse.json({
          ok: false,
          message: "Could not refresh metrics",
          route: "/settings",
        });
      }
    }

    if (type === "MARK_OPP_DONE") {
      const oppId = payload.oppId || payload.id;
      await log({ oppId: oppId || true });
      return NextResponse.json({
        ok: true,
        marked: oppId || true,
        message: "Marked done on device",
        client: "use opportunity-progress local + refresh",
      });
    }

    await log({ routed: type });
    return NextResponse.json({
      ok: true,
      routed: type,
      message: "Opening…",
    });
  } catch (e) {
    console.error("agent execute", e);
    return NextResponse.json({ error: "execute_failed" }, { status: 500 });
  }
}
