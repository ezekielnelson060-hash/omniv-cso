import { NextResponse } from "next/server";
import { zikiComplete } from "@/lib/gemini";

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
