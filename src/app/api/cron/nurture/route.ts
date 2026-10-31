import { NextResponse } from "next/server";
import { runScheduledNurture } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily Omniv nurture sequence (days 2, 5, 8, 12, 17, 22, 28, 35, 42, 50, 60).
 * Behavioural gates + dedupe in runScheduledNurture.
 * Day 0 welcome is sent from /api/email/welcome on signup.
 *
 * Vercel Cron: GET /api/cron/nurture
 * Auth: Authorization: Bearer CRON_SECRET
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY missing", sent: 0 },
      { status: 503 }
    );
  }

  const result = await runScheduledNurture();
  return NextResponse.json({
    ok: true,
    sequence: "omniv-discovery-12",
    days: [2, 5, 8, 12, 17, 22, 28, 35, 42, 50, 60],
    ...result,
  });
}
