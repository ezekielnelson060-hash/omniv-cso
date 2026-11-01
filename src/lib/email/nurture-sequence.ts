/**
 * Omniv discovery nurture sequence (12 emails / 60 days).
 * Bodies only — sending + behavioural gates live in nurture.ts.
 *
 * Behavioural gates (applied in runScheduledNurture):
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
    subject: "How discovery works on Omniv",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">Publishing is only the first step. Discovery is what makes the work useful beyond the moment it goes live.</p>
      <p style="margin:0 0 14px;">On Omniv, publications sit under a public identity and become part of what people can explore when they search topics, browse rising subjects, or follow identities they care about.</p>
      <p style="margin:0 0 14px;">That structure is intentional: so your work stays attached to who published it, and so readers can find related work over time — not only in the first hours after release.</p>
      ${cta(`${APP}/explore`, "Explore what is moving")}
    `
      ),
  },
  {
    day: 8,
    subject: "A clear public identity changes how your work is received",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">Readers and partners judge credibility in seconds. A complete profile and a clear public identity signal that the work belongs to someone (or something) real.</p>
      <p style="margin:0 0 14px;">Whether you publish as yourself, a brand, a company, or a project, take a few minutes to finish the profile and create the identity that should appear next to your publications.</p>
      <p style="margin:0 0 14px;">That identity is the foundation for verification, discovery, and everything that follows.</p>
      ${cta(`${APP}/settings/profile`, "Complete your profile")}
    `
      ),
  },
  {
    day: 12,
    subject: "Publish the work that should stay findable",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">Not everything needs to live forever. Some updates are temporary. Omniv is for the work that should remain part of the public record under your identity.</p>
      <p style="margin:0 0 14px;">Articles, research, releases, product announcements, event details, long-form video, and documents that represent what you stand for — those belong here.</p>
      <p style="margin:0 0 14px;">If you have been waiting for the perfect piece, start with something solid. Momentum comes from publishing, not from perfecting the first one.</p>
      ${cta(`${APP}/publish`, "Publish something lasting")}
    `
      ),
  },
  {
    day: 17,
    subject: "Make your presence stronger before you promote",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">Promotion works best when the underlying presence is solid: a clear identity, a complete profile, and at least a few publications that show what you stand for.</p>
      <p style="margin:0 0 14px;">Before spending attention on visibility tools, finish the foundation. Readers who arrive through promotion should land on something coherent.</p>
      <p style="margin:0 0 14px;">Once that is in place, verification and promotion become multipliers instead of compensations.</p>
      ${cta(`${APP}/home`, "Review your presence")}
    `
      ),
  },
  {
    day: 22,
    subject: "Verification: own a credible identity",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">Verification marks an identity as confirmed. It reduces ambiguity for readers and partners who encounter your work for the first time.</p>
      <p style="margin:0 0 14px;">If you publish under a brand, company, artist name, or organisation, verification is one of the strongest signals you can add.</p>
      <p style="margin:0 0 14px;">It is available when your presence is ready. Completing the profile and publishing under the identity first makes the request straightforward.</p>
      ${cta(`${APP}/settings/verification`, "Explore verification")}
    `
      ),
  },
  {
    day: 28,
    subject: "When a publication deserves more visibility",
    html: (name) =>
      wrap(
        name,
        `
      <p style="margin:0 0 14px;">Some publications matter more than others: a flagship article, a product launch, a research release, or a time-sensitive announcement.</p>
      <p style="margin:0 0 14px;">Omniv Promotion puts additional weight behind selected publications so they can reach more of the people exploring related topics.</p>
      <p style="margin:0 0 14px;">Use it deliberately. Promote the work that represents you best or that needs to be seen in a specific window — not every post.</p>
      ${cta(`${APP}/promote`, "See promotion options")}
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

/** Days after signup for cron (day 0 is welcome on signup/onboarding). */
export const SCHEDULED_NURTURE_DAYS: NurtureDay[] = [
  2, 5, 8, 12, 17, 22, 28, 35, 42, 50, 60,
];
