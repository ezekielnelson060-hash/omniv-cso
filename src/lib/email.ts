/**
 * Resend email helper for Omniv nurture sequences.
 * Requires RESEND_API_KEY in env.
 */

export type NurtureDay = 0 | 2 | 4 | 7 | 10 | 14 | 21 | 30;

const FROM = process.env.RESEND_FROM || "Omniv <onboarding@omniv.media>";

export const NURTURE_SEQUENCE: {
  day: NurtureDay;
  subject: string;
  html: (name: string) => string;
}[] = [
  {
    day: 0,
    subject: "Your Fan Gate is live — first move",
    html: (name) => `
      <p>Hey ${name || "there"},</p>
      <p>You just opened your Omniv career OS. The single highest-leverage move right now:</p>
      <p><strong>Share your Fan Gate.</strong> Put the link in your Instagram / TikTok bio. Fans enter email + city + would attend. That fills your map.</p>
      <p>Streams are vanity. Intent is the asset.</p>
      <p><a href="https://omniv.media/crm">Open your Fan Gate →</a></p>
      <p>— Omniv</p>
    `,
  },
  {
    day: 2,
    subject: "Why your streams don’t mean demand",
    html: (name) => `
      <p>Hey ${name || "there"},</p>
      <p>Monthly listeners look big. Rooms stay empty. That’s not a mystery — streams ≠ people who would show up.</p>
      <p>Omniv captures the only signal that matters: city + would attend. Use the gate. Let the map tell the truth.</p>
      <p><a href="https://omniv.media/crm">Check your map →</a></p>
    `,
  },
  {
    day: 4,
    subject: "How to fill the map this week",
    html: (name) => `
      <p>Hey ${name || "there"},</p>
      <p>Three moves that work:</p>
      <ol>
        <li>Gate link in every bio (IG, TikTok, Linktree, pinned comment)</li>
        <li>Story: “Drop your city if you’d come to a room” + link</li>
        <li>After every post/drop, one CTA back to the gate</li>
      </ol>
      <p>Don’t ask for streams. Ask for intent.</p>
      <p><a href="https://omniv.media/crm">Share your gate →</a></p>
    `,
  },
  {
    day: 7,
    subject: "Your first cash path (rooms + tips)",
    html: (name) => `
      <p>Hey ${name || "there"},</p>
      <p>Once the list has real yeses in a city, open a room sized to the intent — or drop a tip link. That’s money that doesn’t wait for the algorithm.</p>
      <p>Starter unlocks full city map, invite list, rooms & tips.</p>
      <p><a href="https://omniv.media/crm">See ranked cities →</a></p>
    `,
  },
  {
    day: 10,
    subject: "Pre-release playbook: use the list before you drop",
    html: (name) => `
      <p>Hey ${name || "there"},</p>
      <p>Before the next release:</p>
      <ol>
        <li>Open Fan directory → filter Superfans / would-attend / release tag</li>
        <li>Tag your invite list</li>
        <li>Export or invite that segment first</li>
        <li>Then go public</li>
      </ol>
      <p>Owned demand first. Algorithm second.</p>
      <p><a href="https://omniv.media/crm">Prep your release list →</a></p>
    `,
  },
  {
    day: 14,
    subject: "Ready to stop guessing?",
    html: (name) => `
      <p>Hey ${name || "there"},</p>
      <p>Free lets you collect. Starter and Pro turn intent into rooms, ranked moves, and cash paths you control.</p>
      <p>If the gate is filling and you want the full map + unlimited Ziki — upgrade when it feels obvious.</p>
      <p><a href="https://omniv.media/crm">Open Omniv →</a></p>
    `,
  },
  {
    day: 21,
    subject: "Checklist: owned fans this month",
    html: (name) => `
      <p>Hey ${name || "there"},</p>
      <p>Quick check:</p>
      <ul>
        <li>Gate in bio?</li>
        <li>Any cities with would-attend?</li>
        <li>Release list tagged?</li>
        <li>One room or tip path live?</li>
      </ul>
      <p>Consistency on the ranked moves beats more free content.</p>
      <p><a href="https://omniv.media/crm">Run your next move →</a></p>
    `,
  },
  {
    day: 30,
    subject: "30 days in — what’s the list telling you?",
    html: (name) => `
      <p>Hey ${name || "there"},</p>
      <p>A month of Omniv. The map either has real demand lines or it doesn’t. Either way you know more than vanity metrics ever told you.</p>
      <p>Share the gate. Tag the list. Open rooms where the yeses live.</p>
      <p><a href="https://omniv.media/crm">Back to your OS →</a></p>
    `,
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
