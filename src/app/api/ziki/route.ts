import { NextResponse } from "next/server";
import { zikiComplete } from "@/lib/gemini";
import { trackServer } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/server";
import { checkAndIncrementZikiUsage } from "@/lib/ziki-usage";

async function resolvePlan(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("plan, plan_status, billing_status")
    .eq("id", userId)
    .maybeSingle();
  const paid =
    data?.plan_status === "active" ||
    data?.billing_status === "active" ||
    data?.billing_status === "paid";
  if (!paid && data?.plan && data.plan !== "free") {
    return "free";
  }
  return (data?.plan as string) || "free";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      message?: string;
      context?: string;
      history?: string;
    };
    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    let userId: string | null = null;
    let plan = "free";
    let usageMeta: {
      allowed: boolean;
      used: number;
      limit: number | "unlimited";
      day: string;
      period?: string;
      label?: string;
    } | null = null;

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
      if (userId) {
        plan = await resolvePlan(supabase, userId);
        usageMeta = await checkAndIncrementZikiUsage(supabase, userId, plan);
        if (!usageMeta.allowed) {
          return NextResponse.json(
            {
              error: "quota_exceeded",
              text: `**Ziki limit reached**\n\nYour **${plan}** plan allows **${usageMeta.label || usageMeta.limit}**. You have used ${usageMeta.used}.\n\nUpgrade for more depth. Pro and Label include unlimited Ziki.`,
              source: "local",
              usage: usageMeta,
              plan,
            },
            { status: 429 }
          );
        }
      }
    } catch {
      /* soft: continue without hard gate */
    }

    void trackServer({
      name: "ziki_message",
      userId,
      path: "/ziki",
      meta: {
        length: message.length,
        has_history: Boolean(body.history),
        plan,
        used: usageMeta?.used ?? null,
      },
    });

    const system =
      body.context ||
      `You are Ziki, Omniv CSO. Never invent demo artists. Executive briefings with bold headings.`;

    const userPayload = body.history
      ? `${message}\n\n(Conversation so far for continuity:\n${body.history})`
      : message;

    const result = await zikiComplete(userPayload, system);
    return NextResponse.json({
      ...result,
      usage: usageMeta,
      plan,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ziki unavailable" }, { status: 500 });
  }
}
