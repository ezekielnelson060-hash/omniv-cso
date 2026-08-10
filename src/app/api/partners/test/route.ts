import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PARTNERS } from "@/lib/partners";

/** Fire a sample partner signal into Agent via webhook pipeline. */
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { partnerId?: string };
    const def = PARTNERS.find((p) => p.id === body.partnerId) || PARTNERS[0]!;

    const secret = process.env.AGENT_WEBHOOK_SECRET;
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";

    if (!secret) {
      return NextResponse.json(
        {
          error: "AGENT_WEBHOOK_SECRET not set on server",
          hint: "Add secret in Vercel env, then retest.",
        },
        { status: 503 }
      );
    }

    const res = await fetch(`${origin}/api/agent/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({
        userId: user.id,
        title: def.sampleTitle,
        body: def.sampleBody,
        urgency: "today",
        impact: "high",
        externalId: `test-${def.id}-${Date.now()}`,
      }),
    });

    const json = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      proposalId?: string;
      error?: string;
      actionType?: string;
    };

    if (!res.ok) {
      return NextResponse.json(
        { error: json.error || "webhook_failed", status: res.status },
        { status: 502 }
      );
    }

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("social_links")
        .eq("id", user.id)
        .maybeSingle();
      const links = {
        ...((profile?.social_links as Record<string, string>) || {}),
        [`partner_${def.id}_tested`]: new Date().toISOString(),
      };
      await supabase
        .from("profiles")
        .update({ social_links: links })
        .eq("id", user.id);
    } catch {
      /* soft */
    }

    return NextResponse.json({
      ok: true,
      partnerId: def.id,
      proposalId: json.proposalId,
      actionType: json.actionType,
      open: "/notifications",
    });
  } catch (e) {
    console.error("partners test", e);
    return NextResponse.json({ error: "test_failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    partners: PARTNERS.map((p) => ({
      id: p.id,
      name: p.name,
      kind: p.kind,
      path: p.path,
    })),
  });
}
