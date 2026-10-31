import { sendResendEmail as sendRaw } from "@/lib/email/send";

/** Restored — full sequence lives in @/lib/email/nurture for maintainability */
export {
  type NurtureDay,
  NURTURE_SEQUENCE,
  sendNurtureEmail,
  SCHEDULED_NURTURE_DAYS,
  runScheduledNurture,
} from "@/lib/email/nurture";

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
