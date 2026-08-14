import { NextResponse } from "next/server";
import { sendNurtureEmail, type NurtureDay } from "@/lib/email";

/**
 * Trigger a nurture email.
 * POST { to, day, name? }
 * Protect with CRON_SECRET or internal use only.
 */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    to?: string;
    day?: number;
    name?: string;
  };

  if (!body.to || body.day === undefined) {
    return NextResponse.json({ error: "to and day required" }, { status: 400 });
  }

  const day = body.day as NurtureDay;
  const result = await sendNurtureEmail(body.to, day, body.name);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: result.id });
}
