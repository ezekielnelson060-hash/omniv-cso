import { NextResponse } from "next/server";
import { zikiComplete } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      message?: string;
      context?: string;
    };
    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }
    const result = await zikiComplete(message, body.context);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ziki unavailable" }, { status: 500 });
  }
}
