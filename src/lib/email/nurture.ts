import { sendResendEmail as sendRaw } from "@/lib/email/send";
import {
  NURTURE_SEQUENCE,
  type NurtureDay,
  SCHEDULED_NURTURE_DAYS,
} from "@/lib/email/nurture-sequence";

export type { NurtureDay };
export { NURTURE_SEQUENCE, SCHEDULED_NURTURE_DAYS };

export async function sendResendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  return sendRaw({
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    identity: "updates",
  });
}

export async function sendNurtureEmail(
  to: string,
  day: NurtureDay,
  name?: string
) {
  const step = NURTURE_SEQUENCE.find((s) => s.day === day);
  if (!step) return { ok: false, error: "Unknown day" };
  return sendRaw({
    to,
    subject: step.subject,
    html: step.html(name || ""),
    identity: "updates",
    tags: [
      { name: "category", value: "nurture" },
      { name: "day", value: String(day) },
    ],
  });
}

function daysSince(iso: string): number {
  return Math.floor(
    (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24)
  );
}

type UserNurtureContext = {
  hasVerifiedEntity: boolean;
  publicationCount: number;
  publishedInLast14Days: boolean;
};

async function loadUserContext(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<UserNurtureContext> {
  const ctx: UserNurtureContext = {
    hasVerifiedEntity: false,
    publicationCount: 0,
    publishedInLast14Days: false,
  };

  try {
    const { count: verifiedCount } = await supabase
      .from("discovery_entities")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId)
      .eq("verified", true);
    ctx.hasVerifiedEntity = (verifiedCount || 0) > 0;
  } catch {
    /* soft */
  }

  try {
    const { count: pubCount } = await supabase
      .from("discovery_publications")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId);
    ctx.publicationCount = pubCount || 0;

    const since = new Date(Date.now() - 14 * 86_400_000).toISOString();
    const { count: recent } = await supabase
      .from("discovery_publications")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", userId)
      .gte("created_at", since);
    ctx.publishedInLast14Days = (recent || 0) > 0;
  } catch {
    try {
      const { count: pubCount } = await supabase
        .from("discovery_publications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);
      ctx.publicationCount = pubCount || 0;
    } catch {
      /* soft */
    }
  }

  return ctx;
}

function behaviouralSkip(
  day: NurtureDay,
  ctx: UserNurtureContext
): string | null {
  if (day === 22 && ctx.hasVerifiedEntity) return "already_verified";
  if (day === 28 && ctx.publicationCount < 1) return "no_publications_for_promote";
  if (day === 35 && ctx.publicationCount < 1) return "no_publications_for_analytics";
  if (day === 50 && ctx.publishedInLast14Days) return "recently_published";
  return null;
}

export async function runScheduledNurture(): Promise<{
  sent: number;
  skipped: number;
  checked: number;
  errors: string[];
}> {
  if (!process.env.RESEND_API_KEY) {
    return { sent: 0, skipped: 0, checked: 0, errors: ["RESEND_API_KEY missing"] };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    return { sent: 0, skipped: 0, checked: 0, errors: ["Supabase missing"] };
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, created_at")
    .not("email", "is", null)
    .order("created_at", { ascending: false })
    .limit(800);

  if (error) {
    return { sent: 0, skipped: 0, checked: 0, errors: [error.message] };
  }

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const p of profiles || []) {
    if (!p.email || !p.created_at || !p.id) continue;
    const age = daysSince(p.created_at);
    if (!SCHEDULED_NURTURE_DAYS.includes(age as NurtureDay)) continue;

    const day = age as NurtureDay;

    try {
      const { data: existing } = await supabase
        .from("discovery_nurture_log")
        .select("day, skipped")
        .eq("user_id", p.id)
        .eq("day", day)
        .maybeSingle();
      if (existing) {
        skipped += 1;
        continue;
      }
    } catch {
      /* soft */
    }

    const ctx = await loadUserContext(supabase, p.id);
    const reason = behaviouralSkip(day, ctx);
    if (reason) {
      skipped += 1;
      try {
        await supabase.from("discovery_nurture_log").upsert(
          {
            user_id: p.id,
            day,
            skipped: true,
            skip_reason: reason,
            sent_at: new Date().toISOString(),
          },
          { onConflict: "user_id,day" }
        );
      } catch {
        /* soft */
      }
      continue;
    }

    const result = await sendNurtureEmail(
      p.email,
      day,
      p.full_name || undefined
    );
    if (result.ok) {
      sent += 1;
      try {
        await supabase.from("discovery_nurture_log").upsert(
          {
            user_id: p.id,
            day,
            skipped: false,
            skip_reason: null,
            sent_at: new Date().toISOString(),
          },
          { onConflict: "user_id,day" }
        );
      } catch {
        /* soft */
      }
    } else {
      errors.push(`${p.email}: ${result.error}`);
    }
  }

  return {
    sent,
    skipped,
    checked: profiles?.length ?? 0,
    errors: errors.slice(0, 10),
  };
}
