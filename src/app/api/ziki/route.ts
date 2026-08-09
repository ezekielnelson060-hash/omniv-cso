import { NextResponse } from "next/server";
import { zikiComplete, type ZikiAttachment } from "@/lib/gemini";
import { ZIKI_MANAGER_RULES, scrubZikiMarkdown, parseZikiActions } from "@/lib/ziki-voice";
import { trackServer } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/server";
import { checkAndIncrementZikiUsage } from "@/lib/ziki-usage";
import { buildOperatingBrief } from "@/lib/ziki-oversight";

async function liveContext(query: string): Promise<string> {
  const q = query.slice(0, 180).trim();
  if (!q || q.length < 12) return "";
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "OmnivZiki/1.0" },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return "";
    const data = (await res.json()) as {
      AbstractText?: string;
      RelatedTopics?: { Text?: string }[];
    };
    const bits: string[] = [];
    if (data.AbstractText) bits.push(data.AbstractText.slice(0, 400));
    for (const r of data.RelatedTopics || []) {
      if (r.Text) bits.push(r.Text.slice(0, 160));
      if (bits.length >= 4) break;
    }
    if (!bits.length) return "";
    return `\n\nLIVE PUBLIC CONTEXT (verify before treating as fact):\n- ${bits.join("\n- ")}`;
  } catch {
    return "";
  }
}

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
    const fileUri = String((item as { fileUri?: string }).fileUri || "").trim();
    if (fileUri.startsWith("https://generativelanguage.googleapis.com/")) {
      out.push({ name, mimeType, fileUri });
      continue;
    }
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
              text: `**Ziki limit reached**\n\nYour **${plan}** plan allows **${usageMeta.label || usageMeta.limit}**. You have used ${usageMeta.used}.\n\nUpgrade for more depth.`,
              source: "local",
              usage: usageMeta,
              plan,
            },
            { status: 429 }
          );
        }
      }
    } catch {
      /* soft */
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

    let operatingBrief = "";
    if (userId) {
      try {
        const supabase = await createClient();
        const brief = await buildOperatingBrief(supabase, userId);
        operatingBrief = brief.text;
      } catch {
        /* soft */
      }
    }

    const system = [
      body.context || "You are Ziki, Omniv CSO. Never invent demo artists.",
      operatingBrief,
      ZIKI_MANAGER_RULES,
    ]
      .filter(Boolean)
      .join("\n\n");

    const live = await liveContext(message || "");
    const userPayload = body.history
      ? `${message || "(See attached media)"}\n\n(Conversation so far:\n${body.history})${live}`
      : `${message || "Listen to the attached media. Manager-grade assessment for my Artist Brain."}${live}`;

    const result = await zikiComplete(
      userPayload,
      system,
      attachments.length ? attachments : undefined
    );
    const rawText = result.text || "";
    const actions = parseZikiActions(rawText);
    return NextResponse.json({
      ...result,
      text: scrubZikiMarkdown(rawText),
      actions,
      usage: usageMeta,
      plan,
      multimodal: attachments.length > 0,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ziki unavailable" }, { status: 500 });
  }
}
