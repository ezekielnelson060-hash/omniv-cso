import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  sendNurtureEmail,
  type NurtureDay,
} from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Days after signup that trigger a nurture email (day 0 is onboarding). */
const SCHEDULED: NurtureDay[] = [2, 4, 7, 10, 14, 21, 30];

function daysSince(iso: string): number {
  const created = new Date(iso).getTime();
  const now = Date.now();
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
}

/**
 * Daily nurture sequence.
 * Vercel Cron: GET /api/cron/nurture
 * Auth: Authorization: Bearer CRON_SECRET
 *
 * Sends the email for the exact day-since-signup match (2, 4, 7, …).
 * Day 0 is sent from /api/email/welcome on onboarding.
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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    return NextResponse.json({ error: "Supabase missing" }, { status: 500 });
  }

  const supabase = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at")
    .not("email", "is", null)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message, sent: 0 }, { status: 500 });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const p of profiles || []) {
    if (!p.email || !p.created_at) continue;
    const age = daysSince(p.created_at);
    if (!SCHEDULED.includes(age as NurtureDay)) continue;

    const day = age as NurtureDay;
    const result = await sendNurtureEmail(
      p.email,
      day,
      p.full_name || undefined
    );
    if (result.ok) {
      sent += 1;
    } else {
      errors.push(`${p.email}: ${result.error}`);
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    checked: profiles?.length ?? 0,
    errors: errors.slice(0, 10),
  });
}
