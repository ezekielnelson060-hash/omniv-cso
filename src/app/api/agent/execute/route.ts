import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { AgentActionType } from "@/lib/agent/types";

export const runtime = "nodejs";

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

    if (body.type === "CREATE_TASK") {
      const title =
        body.title ||
        body.payload?.title ||
        body.payload?.q?.slice(0, 120) ||
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
      return NextResponse.json({ ok: true, taskId: data?.id });
    }

    if (body.type === "CREATE_ROOM") {
      const city = (body.payload?.city || "").trim();
      const title =
        (body.title || body.payload?.title || "").trim() ||
        (city ? `Room · ${city}` : "Drop party");
      const { data, error } = await supabase
        .from("gatherings")
        .insert({
          user_id: user.id,
          title: title.slice(0, 120),
          city: city || null,
          status: "draft",
          room_type: body.payload?.room_type || "drop_party",
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
        return NextResponse.json({
          ok: true,
          gatheringId: d2?.id,
          route: d2?.id ? `/g/${d2.id}` : "/crm",
        });
      }
      return NextResponse.json({
        ok: true,
        gatheringId: data?.id,
        route: data?.id ? `/g/${data.id}` : "/crm",
      });
    }

    if (body.type === "MARK_OPP_DONE") {
      const oppId = body.payload?.oppId || body.payload?.id;
      return NextResponse.json({
        ok: true,
        marked: oppId || true,
        client: "use opportunity-progress local + refresh",
      });
    }

    return NextResponse.json({ ok: true, routed: body.type });
  } catch (e) {
    console.error("agent execute", e);
    return NextResponse.json({ error: "execute_failed" }, { status: 500 });
  }
}
