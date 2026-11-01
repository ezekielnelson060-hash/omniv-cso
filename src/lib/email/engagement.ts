/**
 * Engagement emails — stream: notify · identity: notifications@
 * Event-triggered (not nurture cron).
 */

import { sendResendEmail } from "./send";
import { ctaButton, emailLayout, greeting } from "./layout";

const APP = process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media";

function actorLabel(name?: string): string {
  const n = name?.trim();
  return n && n.length > 0 ? n : "Someone";
}

/** Someone followed the recipient (or their entity). */
export async function sendFollowEmail(opts: {
  to: string;
  recipientName?: string;
  actorName?: string;
  /** entity | user */
  targetKind?: string;
  targetName?: string;
  href?: string;
}) {
  const actor = actorLabel(opts.actorName);
  const target =
    opts.targetKind === "entity" && opts.targetName
      ? opts.targetName
      : "you";
  const subject =
    target === "you"
      ? `${actor} followed you on Omniv`
      : `${actor} followed ${target} on Omniv`;

  const html = emailLayout({
    preheader: subject,
    bodyHtml: `
      ${greeting(opts.recipientName)}
      <p style="margin:0 0 14px;"><strong style="color:#fff;">${actor}</strong> started following ${target === "you" ? "you" : `<strong style="color:#fff;">${target}</strong>`} on Omniv.</p>
      <p style="margin:0 0 14px;">When people follow an identity, they are more likely to see future publications from that presence.</p>
      ${ctaButton(opts.href || `${APP}/notifications`, "View activity")}
      <p style="margin:28px 0 0;color:#888;font-size:13px;">Omniv</p>
    `,
  });

  return sendResendEmail({
    to: opts.to,
    subject,
    html,
    identity: "notifications",
    tags: [
      { name: "category", value: "engagement" },
      { name: "template", value: "follow" },
    ],
  });
}

/** Someone liked (or interacted with) a publication. */
export async function sendLikeEmail(opts: {
  to: string;
  recipientName?: string;
  actorName?: string;
  publicationTitle?: string;
  publicationSlug?: string;
  href?: string;
}) {
  const actor = actorLabel(opts.actorName);
  const title = opts.publicationTitle?.trim() || "your publication";
  const subject = `${actor} liked ${title.length > 48 ? title.slice(0, 45) + "…" : title}`;
  const path =
    opts.href ||
    (opts.publicationSlug ? `${APP}/p/${opts.publicationSlug}` : `${APP}/notifications`);

  const html = emailLayout({
    preheader: subject,
    bodyHtml: `
      ${greeting(opts.recipientName)}
      <p style="margin:0 0 14px;"><strong style="color:#fff;">${actor}</strong> liked <strong style="color:#fff;">${title}</strong>.</p>
      <p style="margin:0 0 14px;">Engagement signals help surface work that is resonating with readers exploring Omniv.</p>
      ${ctaButton(path, "Open publication")}
      <p style="margin:28px 0 0;color:#888;font-size:13px;">Omniv</p>
    `,
  });

  return sendResendEmail({
    to: opts.to,
    subject,
    html,
    identity: "notifications",
    tags: [
      { name: "category", value: "engagement" },
      { name: "template", value: "like" },
    ],
  });
}

/** Confirmation that a publication went live. */
export async function sendPublishedSuccessEmail(opts: {
  to: string;
  recipientName?: string;
  title: string;
  slug: string;
  path?: string;
}) {
  const title = opts.title.trim() || "Your publication";
  const path = opts.path || `${APP}/p/${opts.slug}`;

  const html = emailLayout({
    preheader: `Published: ${title}`,
    bodyHtml: `
      ${greeting(opts.recipientName)}
      <p style="margin:0 0 14px;"><strong style="color:#fff;">${title}</strong> is now live on Omniv.</p>
      <p style="margin:0 0 14px;">It is attached to your public identity and available for discovery. Share the link, or keep publishing the next piece of work that should last.</p>
      ${ctaButton(path, "View publication")}
      <p style="margin:16px 0 0;">${ctaButton(`${APP}/analytics`, "See analytics")}</p>
      <p style="margin:28px 0 0;color:#888;font-size:13px;">Omniv</p>
    `,
  });

  return sendResendEmail({
    to: opts.to,
    subject: `Published: ${title.length > 60 ? title.slice(0, 57) + "…" : title}`,
    html,
    identity: "notifications",
    tags: [
      { name: "category", value: "engagement" },
      { name: "template", value: "published" },
    ],
  });
}

/** Weekly activity digest for publishers with recent signals. */
export async function sendWeeklySummaryEmail(opts: {
  to: string;
  recipientName?: string;
  stats: {
    newFollowers?: number;
    likes?: number;
    saves?: number;
    publicationsPublished?: number;
    topTitle?: string;
  };
}) {
  const s = opts.stats;
  const lines: string[] = [];
  if (s.newFollowers && s.newFollowers > 0)
    lines.push(`<li style="margin-bottom:6px;"><strong style="color:#fff;">${s.newFollowers}</strong> new follower${s.newFollowers === 1 ? "" : "s"}</li>`);
  if (s.likes && s.likes > 0)
    lines.push(`<li style="margin-bottom:6px;"><strong style="color:#fff;">${s.likes}</strong> like${s.likes === 1 ? "" : "s"} on your work</li>`);
  if (s.saves && s.saves > 0)
    lines.push(`<li style="margin-bottom:6px;"><strong style="color:#fff;">${s.saves}</strong> save${s.saves === 1 ? "" : "s"}</li>`);
  if (s.publicationsPublished && s.publicationsPublished > 0)
    lines.push(`<li style="margin-bottom:6px;"><strong style="color:#fff;">${s.publicationsPublished}</strong> publication${s.publicationsPublished === 1 ? "" : "s"} went live</li>`);
  if (s.topTitle)
    lines.push(`<li style="margin-bottom:6px;">Notable: <strong style="color:#fff;">${s.topTitle}</strong></li>`);

  if (lines.length === 0) {
    return { ok: false as const, error: "no_activity" };
  }

  const html = emailLayout({
    preheader: "Your week on Omniv",
    bodyHtml: `
      ${greeting(opts.recipientName)}
      <p style="margin:0 0 14px;">Here is a snapshot of activity around your presence this week:</p>
      <ul style="margin:0 0 14px;padding-left:20px;color:#ccc;">
        ${lines.join("\n")}
      </ul>
      <p style="margin:0 0 14px;">Keep publishing work that should remain findable. Discovery compounds when the record is active.</p>
      ${ctaButton(`${APP}/analytics`, "Open analytics")}
      <p style="margin:28px 0 0;color:#888;font-size:13px;">Omniv · weekly summary</p>
    `,
  });

  return sendResendEmail({
    to: opts.to,
    subject: "Your week on Omniv",
    html,
    identity: "notifications",
    tags: [
      { name: "category", value: "engagement" },
      { name: "template", value: "weekly_summary" },
    ],
  });
}
