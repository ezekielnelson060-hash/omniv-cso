/**
 * Low-level Resend send helper.
 */

import { fromAddress, type EmailIdentity } from "./config";

export type SendResult = { ok: boolean; id?: string; error?: string };

export async function sendResendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  identity?: EmailIdentity;
  /** Explicit From override */
  from?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { ok: false, error: "RESEND_API_KEY not set" };
  }

  const identity = opts.identity || "hello";
  const from = opts.from || fromAddress(identity);
  const to = Array.isArray(opts.to) ? opts.to : [opts.to];

  const body: Record<string, unknown> = {
    from,
    to,
    subject: opts.subject,
    html: opts.html,
  };
  if (opts.replyTo) body.reply_to = opts.replyTo;
  if (opts.tags?.length) body.tags = opts.tags;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as { id?: string; message?: string };
  if (!res.ok) {
    return { ok: false, error: data.message || res.statusText };
  }
  return { ok: true, id: data.id };
}
