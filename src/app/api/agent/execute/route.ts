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

    return NextResponse.json({ ok: true, routed: body.type });
  } catch (e) {
    console.error("agent execute", e);
    return NextResponse.json({ error: "execute_failed" }, { status: 500 });
  }
}
