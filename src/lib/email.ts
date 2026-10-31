/**
 * Resend email helper — Omniv discovery nurture sequence (12 emails / 60 days).
 * From: onboarding@omniv.media (RESEND_FROM override supported).
 * Requires RESEND_API_KEY.
 *
 * Behavioural gates (cron):
 * - Day 22 verification: skip if user already has a verified entity
 * - Day 28 promotion: skip if user has no publications
 * - Day 35 analytics: skip if user has no publications
 * - Day 50 re-publish nudge: skip if published in last 14 days
 * - Dedup via discovery_nurture_log (user_id, day)
 */

export type NurtureDay =
  | 0
  | 2
  | 5
  | 8
  | 12
  | 17
  | 22
  | 28
  | 35
  | 42
  | 50
  | 60;

const FROM = process.env.RESEND_FROM || "Omniv <onboarding@omniv.media>";
const APP = "https://omniv.media";

function wrap(name: string, body: string): string {
  const who = name?.trim() || "there";
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#111;border-radius:16px;border:1px solid #222;">
        <tr><td style="padding:28px 28px 8px;color:#c9a227;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;">Omniv</td></tr>
        <tr><td style="padding:8px 28px 28px;color:#e8e8e8;font-size:15px;line-height:1.65;">
          <p style="margin:0 0 16px;color:#fff;">Hello ${who},</p>
          ${body}
          <p style="margin:28px 0 0;color:#888;font-size:13px;">The Omniv Team</p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;color:#555;font-size:11px;">Omniv — discover what's moving · <a href="${APP}" style="color:#888;">${APP.replace("https://","")}</a></p>
    </td></tr>
  </table>
</body>
</html>`;
}

function cta(href: string, label: string): string {
  return `<p style="margin:24px 0 8px;"><a href="${href}" style="display:inline-block;background:#c9a227;color:#000;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px;">${label}</a></p>`;
}

export const NURTURE_SEQUENCE: {
  day: NurtureDay;
  subject: string;
  html: (name: string) => string;
}[] = [
  {
    day: 0,
    subject: "Welcome to Omniv",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">Welcome to Omniv — a place to publish work that should last longer than a temporary appearance in a feed.</p>
      <p style="margin:0 0 14px;">Here you can publish articles, music, video, PDFs, announcements and more under a clear public identity, and be discovered by people exploring what is moving.</p>
      <p style="margin:0 0 14px;"><strong style="color:#fff;">Your first steps:</strong></p>
      <ol style="margin:0 0 14px;padding-left:20px;color:#ccc;">
        <li style="margin-bottom:8px;">Complete your profile</li>
        <li style="margin-bottom:8px;">Create a public identity if you publish as a brand, company, or artist</li>
        <li style="margin-bottom:8px;">Publish your first piece of work</li>
      </ol>
      <p style="margin:0 0 14px;">Omniv is built for credibility, visibility, and understanding performance — not only posting and hoping.</p>
      ${cta(`${APP}/home`, "Open Omniv")}
    `
      ),
  },
  {
    day: 2,
    subject: "Your content deserves more than a temporary appearance",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">Most of the internet treats content as disposable. It appears, competes for attention for a moment, then disappears.</p>
      <p style="margin:0 0 14px;">Omniv is designed for work that should remain findable: ideas, releases, research, products, events, and public updates that represent who you are or what your organisation stands for.</p>
      <p style="margin:0 0 14px;">When you publish on Omniv, you are building a body of work under an identity — not only filling a feed.</p>
      <p style="margin:0 0 14px;">That is the problem Omniv exists to solve.</p>
      ${cta(`${APP}/publish`, "Publish on Omniv")}
    `
      ),
  },
  {
    day: 5,
    subject: "What should you publish on Omniv?",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">If you are unsure what belongs on Omniv, start with work that should still matter in a week, a month, or a year.</p>
      <p style="margin:0 0 14px;"><strong style="color:#fff;">Strong fits include:</strong></p>
      <ul style="margin:0 0 14px;padding-left:20px;color:#ccc;">
        <li style="margin-bottom:8px;">Articles and long-form ideas</li>
        <li style="margin-bottom:8px;">Music and video releases</li>
        <li style="margin-bottom:8px;">PDFs, research, and reports</li>
        <li style="margin-bottom:8px;">Product and company announcements</li>
        <li style="margin-bottom:8px;">Events and public updates</li>
      </ul>
      <p style="margin:0 0 14px;">Publish under the right identity — personal, artist, brand, or organisation — so explorers know who the work belongs to.</p>
      ${cta(`${APP}/publish`, "Start publishing")}
    `
      ),
  },
  {
    day: 8,
    subject: "Publishing is only half the equation",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">Publishing puts your work on the record. Discovery is how people find it.</p>
      <p style="margin:0 0 14px;">On Omniv, explorers move through Home, Explore, topics, and people they follow. Your publications can surface as something worth knowing — not only as a one-time post to your existing circle.</p>
      <p style="margin:0 0 14px;">Clear titles, strong covers, and consistent publishing under one identity all improve how discoverable your work becomes.</p>
      <p style="margin:0 0 14px;">Publishing is the start. Being found is the other half.</p>
      ${cta(`${APP}/explore`, "See how discovery works")}
    `
      ),
  },
  {
    day: 12,
    subject: "Your Omniv profile is more than a profile",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">On Omniv, presence is structured around identity.</p>
      <p style="margin:0 0 14px;">You can publish as yourself, or create public pages for an artist, brand, company, organisation, or project. Each identity carries its own publications, followers, and credibility.</p>
      <p style="margin:0 0 14px;">That means your Omniv presence is not a single social bio — it is a home for the work you want the world to associate with that name.</p>
      <p style="margin:0 0 14px;">Take a moment to make sure the identity you publish under is complete and intentional.</p>
      ${cta(`${APP}/accounts`, "Review your identities")}
    `
      ),
  },
  {
    day: 17,
    subject: "One publication is a start. A library of work is an asset.",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">A single publication shows what you can do. A library of work shows who you are.</p>
      <p style="margin:0 0 14px;">Explorers, partners, and future audiences understand you faster when they can see a body of published work — not one isolated piece.</p>
      <p style="margin:0 0 14px;">Consistency compounds. Each article, release, or announcement strengthens your presence on Omniv and gives discovery more to work with.</p>
      <p style="margin:0 0 14px;">If you have only published once, your next piece is how the asset begins.</p>
      ${cta(`${APP}/publish`, "Publish again")}
    `
      ),
  },
  {
    day: 22,
    subject: "Make your identity stand out. Get verified on Omniv.",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">On the internet, establishing a credible identity matters.</p>
      <p style="margin:0 0 14px;">Whether you're building a personal brand, representing a company, growing an organisation or developing a creative presence, people want confidence in who they're engaging with.</p>
      <p style="margin:0 0 14px;">That's where Omniv Verification comes in.</p>
      <p style="margin:0 0 14px;">With Omniv's paid verification feature, eligible publishers can establish a verified identity on the platform.</p>
      <p style="margin:0 0 14px;">Verification helps distinguish your presence and gives your profile an additional layer of credibility.</p>
      <p style="margin:0 0 14px;">Omniv offers verification options designed around different publisher categories, including:</p>
      <ul style="margin:0 0 14px;padding-left:20px;color:#ccc;">
        <li style="margin-bottom:8px;">Individuals and public figures</li>
        <li style="margin-bottom:8px;">Artists and creators</li>
        <li style="margin-bottom:8px;">Brands</li>
        <li style="margin-bottom:8px;">Companies and organisations</li>
      </ul>
      <p style="margin:0 0 14px;">Your identity is part of your digital presence. Give it the recognition it deserves.</p>
      <p style="margin:0 0 14px;">Ready to get verified?</p>
      ${cta(`${APP}/verify`, "Explore verification on Omniv")}
    `
      ),
  },
  {
    day: 28,
    subject: "Give your best content more visibility",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">Publishing valuable content is one thing.</p>
      <p style="margin:0 0 14px;">Getting it in front of more people is another.</p>
      <p style="margin:0 0 14px;">Sometimes, your most important publication deserves additional exposure.</p>
      <p style="margin:0 0 14px;">Whether you're announcing a product, sharing an article, promoting an event, showcasing research or introducing a new project, Omniv's promotion feature gives you an opportunity to increase the visibility of selected content.</p>
      <p style="margin:0 0 14px;">You can promote publications using available campaign options and budgets based on your promotional goals.</p>
      <p style="margin:0 0 14px;">Instead of relying entirely on organic discovery, you can put additional promotional support behind the content that matters most.</p>
      <p style="margin:0 0 14px;">Think strategically about what you promote.</p>
      <p style="margin:0 0 14px;">A product announcement, important article, new release or major company update could be worth giving additional visibility.</p>
      <p style="margin:0 0 14px;">Ready to put your content forward?</p>
      ${cta(`${APP}/promote`, "Explore promotion on Omniv")}
    `
      ),
  },
  {
    day: 35,
    subject: "Understand how your content performs",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">Publishing without understanding performance leaves important questions unanswered.</p>
      <p style="margin:0 0 14px;">Which publications are attracting attention?</p>
      <p style="margin:0 0 14px;">What content is resonating with your audience?</p>
      <p style="margin:0 0 14px;">Are people discovering and engaging with your work?</p>
      <p style="margin:0 0 14px;">Omniv Analytics helps publishers understand how their content and presence are performing through available account and publication insights.</p>
      <p style="margin:0 0 14px;">Rather than guessing, you can use performance information to make more informed publishing decisions.</p>
      <p style="margin:0 0 14px;">For businesses, this means gaining a better understanding of how their published work is performing.</p>
      <p style="margin:0 0 14px;">For creators and independent publishers, it means identifying which content is attracting interest.</p>
      <p style="margin:0 0 14px;">For organisations, it means having more visibility into their publishing activity.</p>
      <p style="margin:0 0 14px;">Better publishing decisions start with better information.</p>
      ${cta(`${APP}/analytics`, "Explore your Omniv analytics")}
    `
      ),
  },
  {
    day: 42,
    subject: "Turn your Omniv presence into a growth channel",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">By now you have seen the full picture: publish under a clear identity, be discovered, strengthen credibility, increase visibility when it matters, and learn from performance.</p>
      <p style="margin:0 0 14px;">Together, those pieces turn Omniv from a place you post into a channel you can grow.</p>
      <ul style="margin:0 0 14px;padding-left:20px;color:#ccc;">
        <li style="margin-bottom:8px;"><strong style="color:#fff;">Verification</strong> — own a credible identity</li>
        <li style="margin-bottom:8px;"><strong style="color:#fff;">Promotion</strong> — put weight behind key publications</li>
        <li style="margin-bottom:8px;"><strong style="color:#fff;">Analytics</strong> — see what is working</li>
      </ul>
      <p style="margin:0 0 14px;">Use the tools that match your stage. Keep publishing the work that should last.</p>
      ${cta(`${APP}/home`, "Continue on Omniv")}
    `
      ),
  },
  {
    day: 50,
    subject: "Your next opportunity to be discovered starts with publishing",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">Discovery on Omniv begins with something published.</p>
      <p style="margin:0 0 14px;">If it has been a while since your last publication, this is a good moment to return — with an article, a release, an update, or a document worth keeping public.</p>
      <p style="margin:0 0 14px;">You do not need a perfect campaign. You need work on the record under the identity you want people to find.</p>
      <p style="margin:0 0 14px;">Your next opportunity to be discovered starts there.</p>
      ${cta(`${APP}/publish`, "Publish something new")}
    `
      ),
  },
  {
    day: 60,
    subject: "Your next chapter on Omniv",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">Two months into Omniv is a natural point to look forward.</p>
      <p style="margin:0 0 14px;">Whether you are building a personal body of work, representing a company, or growing a creative presence, the path is the same: publish with intention, strengthen identity, use visibility tools when they serve the work, and learn from what resonates.</p>
      <p style="margin:0 0 14px;">Your next chapter on Omniv is whatever you choose to put on the record next.</p>
      <p style="margin:0 0 14px;">We are glad you are here.</p>
      ${cta(`${APP}/home`, "Return to Omniv")}
    `
      ),
  },
];

export async function sendResendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { ok: false, error: "RESEND_API_KEY not set" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });

  const data = (await res.json()) as { id?: string; message?: string };
  if (!res.ok) {
    return { ok: false, error: data.message || res.statusText };
  }
  return { ok: true, id: data.id };
}

export async function sendNurtureEmail(
  to: string,
  day: NurtureDay,
  name?: string
) {
  const step = NURTURE_SEQUENCE.find((s) => s.day === day);
  if (!step) return { ok: false, error: "Unknown day" };
  return sendResendEmail({
    to,
    subject: step.subject,
    html: step.html(name || ""),
  });
}

/** Days after signup for cron (day 0 is welcome on signup/onboarding). */
export const SCHEDULED_NURTURE_DAYS: NurtureDay[] = [
  2, 5, 8, 12, 17, 22, 28, 35, 42, 50, 60,
];

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
    // Fallback: publications may use author_id / user_id
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

/**
 * Returns skip reason or null if the email should send.
 */
function behaviouralSkip(
  day: NurtureDay,
  ctx: UserNurtureContext
): string | null {
  if (day === 22 && ctx.hasVerifiedEntity) {
    return "already_verified";
  }
  if (day === 28 && ctx.publicationCount < 1) {
    return "no_publications_for_promote";
  }
  if (day === 35 && ctx.publicationCount < 1) {
    return "no_publications_for_analytics";
  }
  if (day === 50 && ctx.publishedInLast14Days) {
    return "recently_published";
  }
  return null;
}

/**
 * Send nurture emails for users whose signup age matches the sequence.
 * Applies behavioural gates + dedupe log.
 */
export async function runScheduledNurture(): Promise<{
  sent: number;
  skipped: number;
  checked: number;
  errors: string[];
}> {
  if (!process.env.RESEND_API_KEY) {
    return {
      sent: 0,
      skipped: 0,
      checked: 0,
      errors: ["RESEND_API_KEY missing"],
    };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    return {
      sent: 0,
      skipped: 0,
      checked: 0,
      errors: ["Supabase missing"],
    };
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
    return {
      sent: 0,
      skipped: 0,
      checked: 0,
      errors: [error.message],
    };
  }

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const p of profiles || []) {
    if (!p.email || !p.created_at || !p.id) continue;
    const age = daysSince(p.created_at);
    if (!SCHEDULED_NURTURE_DAYS.includes(age as NurtureDay)) continue;

    const day = age as NurtureDay;

    // Dedupe: already sent or skipped this day
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
      /* table may not exist yet — continue without dedupe */
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
