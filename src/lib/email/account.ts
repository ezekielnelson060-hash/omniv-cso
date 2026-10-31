/**
 * Account / transactional emails — stream: notify.omniv.media
 * Identities: hello@, accounts@, security@
 */

import { sendResendEmail } from "./send";
import { ctaButton, emailLayout, greeting } from "./layout";

const APP = process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media";

export async function sendWelcomeEmail(to: string, name?: string) {
  const html = emailLayout({
    preheader: "Welcome to Omniv — publish work that lasts",
    bodyHtml: `
      ${greeting(name)}
      <p style="margin:0 0 14px;">Welcome to Omniv — a place to publish work that should last longer than a temporary appearance in a feed.</p>
      <p style="margin:0 0 14px;">Here you can publish articles, music, video, PDFs, announcements and more under a clear public identity.</p>
      <p style="margin:0 0 14px;"><strong style="color:#fff;">Your first steps:</strong></p>
      <ol style="margin:0 0 14px;padding-left:20px;color:#ccc;">
        <li style="margin-bottom:8px;">Complete your profile</li>
        <li style="margin-bottom:8px;">Create a public identity if you publish as a brand, company, or artist</li>
        <li style="margin-bottom:8px;">Publish your first piece of work</li>
      </ol>
      ${ctaButton(`${APP}/home`, "Open Omniv")}
      <p style="margin:28px 0 0;color:#888;font-size:13px;">The Omniv Team</p>
    `,
  });

  return sendResendEmail({
    to,
    subject: "Welcome to Omniv",
    html,
    identity: "hello",
    tags: [
      { name: "category", value: "account" },
      { name: "template", value: "welcome" },
    ],
  });
}

/** Informational — Supabase still owns the actual confirm link when using Auth email. */
export async function sendVerifyEmailNotice(to: string, name?: string) {
  const html = emailLayout({
    preheader: "Verify your email on Omniv",
    bodyHtml: `
      ${greeting(name)}
      <p style="margin:0 0 14px;">Please verify your email address so we can secure your Omniv account and keep you informed about your publications.</p>
      <p style="margin:0 0 14px;">If you already clicked the verification link from signup, you can ignore this message.</p>
      ${ctaButton(`${APP}/login`, "Sign in to Omniv")}
      <p style="margin:28px 0 0;color:#888;font-size:13px;">Omniv Accounts</p>
    `,
  });

  return sendResendEmail({
    to,
    subject: "Verify your email — Omniv",
    html,
    identity: "accounts",
    tags: [
      { name: "category", value: "account" },
      { name: "template", value: "verify_notice" },
    ],
  });
}

/**
 * Password reset — prefer Supabase resetPasswordForEmail for the secure link.
 * This sends a branded notice when we also surface a recovery URL from Auth.
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  name?: string
) {
  const html = emailLayout({
    preheader: "Reset your Omniv password",
    bodyHtml: `
      ${greeting(name)}
      <p style="margin:0 0 14px;">We received a request to reset the password for your Omniv account.</p>
      <p style="margin:0 0 14px;">If you made this request, use the button below. The link expires for your security.</p>
      ${ctaButton(resetUrl, "Reset password")}
      <p style="margin:16px 0 0;color:#888;font-size:13px;">If you did not request this, you can ignore this email. Your password will stay the same.</p>
      <p style="margin:28px 0 0;color:#888;font-size:13px;">Omniv Security</p>
    `,
  });

  return sendResendEmail({
    to,
    subject: "Reset your Omniv password",
    html,
    identity: "security",
    tags: [
      { name: "category", value: "security" },
      { name: "template", value: "password_reset" },
    ],
  });
}

export async function sendPasswordChangedEmail(to: string, name?: string) {
  const html = emailLayout({
    preheader: "Your Omniv password was changed",
    bodyHtml: `
      ${greeting(name)}
      <p style="margin:0 0 14px;">Your Omniv account password was changed successfully.</p>
      <p style="margin:0 0 14px;">If you did this, no further action is needed.</p>
      <p style="margin:0 0 14px;">If you did <strong style="color:#fff;">not</strong> change your password, reset it immediately and contact support.</p>
      ${ctaButton(`${APP}/forgot-password`, "Secure my account")}
      <p style="margin:28px 0 0;color:#888;font-size:13px;">Omniv Security</p>
    `,
  });

  return sendResendEmail({
    to,
    subject: "Your Omniv password was changed",
    html,
    identity: "security",
    tags: [
      { name: "category", value: "security" },
      { name: "template", value: "password_changed" },
    ],
  });
}

export async function sendNewLoginAlertEmail(
  to: string,
  detail: { when?: string; ip?: string; device?: string },
  name?: string
) {
  const bits = [
    detail.when ? `Time: ${detail.when}` : null,
    detail.ip ? `IP: ${detail.ip}` : null,
    detail.device ? `Device: ${detail.device}` : null,
  ]
    .filter(Boolean)
    .join("<br/>");

  const html = emailLayout({
    preheader: "New sign-in on your Omniv account",
    bodyHtml: `
      ${greeting(name)}
      <p style="margin:0 0 14px;">We noticed a new sign-in to your Omniv account.</p>
      ${bits ? `<p style="margin:0 0 14px;color:#ccc;">${bits}</p>` : ""}
      <p style="margin:0 0 14px;">If this was you, you can ignore this message. If not, change your password and review active sessions.</p>
      ${ctaButton(`${APP}/settings/security`, "Review security settings")}
      <p style="margin:28px 0 0;color:#888;font-size:13px;">Omniv Security</p>
    `,
  });

  return sendResendEmail({
    to,
    subject: "New sign-in on your Omniv account",
    html,
    identity: "security",
    tags: [
      { name: "category", value: "security" },
      { name: "template", value: "new_login" },
    ],
  });
}
