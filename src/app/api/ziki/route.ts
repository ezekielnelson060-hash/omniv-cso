import { NextResponse } from "next/server";
import { zikiComplete, type ZikiAttachment } from "@/lib/gemini";
import { trackServer } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/server";
import { checkAndIncrementZikiUsage } from "@/lib/ziki-usage";

/** ~12MB decoded; leave headroom under Gemini 20MB request limit */
const MAX_ATTACHMENT_BYTES = 12 * 1024 * 1024;
const MAX_ATTACHMENTS = 4;

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

function sanitizeAttachments(raw: unknown): ZikiAttachment[] {
  if (!Array.isArray(raw)) return [];
  const out: ZikiAttachment[] = [];
  for (const item of raw.slice(0, MAX_ATTACHMENTS)) {
    if (!item || typeof item !== "object") continue;
    const name = String((item as { name?: string }).name || "file").slice(0, 180);
    const mimeType = String(
      (item as { mimeType?: string }).mimeType || "application/octet-stream"
    ).slice(0, 80);
    let data = String((item as { data?: string }).data || "").replace(/\s/g, "");
    const comma = data.indexOf(",");
    if (data.startsWith("data:") && comma > 0) {
      data = data.slice(comma + 1);
    }
    if (!data || data.length < 32) continue;
    const approxBytes = Math.floor((data.length * 3) / 4);
    if (approxBytes > MAX_ATTACHMENT_BYTES) continue;
    out.push({ name, mimeType, data });
  }
  return out;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      message?: string;
      context?: string;
      history?: string;
      attachments?: unknown;
    };
    const message = body.message?.trim();
    const attachments = sanitizeAttachments(body.attachments);
    if (!message && attachments.length === 0) {
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
        length: (message || "").length,
        has_history: Boolean(body.history),
        has_attachments: attachments.length > 0,
        attachment_count: attachments.length,
        plan,
        used: usageMeta?.used ?? null,
      },
    });

    const system =
      body.context ||
      `You are Ziki, Omniv CSO. Never invent demo artists. Executive briefings with bold headings.`;

    const userPayload = body.history
      ? `${message || "(See attached media)"}\n\n(Conversation so far for continuity:\n${body.history})`
      : message ||
        "Listen to the attached audio/media. Give a manager-grade assessment aligned to my Artist Brain.";

    const result = await zikiComplete(
      userPayload,
      system,
      attachments.length ? attachments : undefined
    );
    return NextResponse.json({
      ...result,
      usage: usageMeta,
      plan,
      multimodal: attachments.length > 0,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ziki unavailable" }, { status: 500 });
  }
}
