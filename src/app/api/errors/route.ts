import { NextResponse } from "next/server";

/** Client errors → Vercel logs (+ optional ERROR_WEBHOOK_URL). */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const line = {
      level: "error",
      source: "client",
      message: body?.message,
      path: body?.path,
      component: body?.component,
      stack:
        typeof body?.stack === "string" ? body.stack.slice(0, 2000) : undefined,
      ua: body?.ua,
      ts: body?.ts || new Date().toISOString(),
    };
    console.error("[omniv-client-error]", JSON.stringify(line));

    const hook = process.env.ERROR_WEBHOOK_URL;
    if (hook) {
      void fetch(hook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(line),
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
