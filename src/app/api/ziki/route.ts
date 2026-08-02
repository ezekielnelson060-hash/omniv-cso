import { NextResponse } from "next/server";
import { zikiComplete } from "@/lib/gemini";
import { trackServer } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/server";

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
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      /* */
    }

    void trackServer({
      name: "ziki_message",
      userId,
      path: "/ziki",
      meta: { length: message.length, has_history: Boolean(body.history) },
    });

    const system =
      body.context ||
      `You are Ziki, Omniv CSO. Never invent demo artists. Executive briefings with bold headings.`;

    const userPayload = body.history
      ? `${message}\n\n(Conversation so far for continuity:\n${body.history})`
      : message;

    const result = await zikiComplete(userPayload, system);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ziki unavailable" }, { status: 500 });
  }
}
