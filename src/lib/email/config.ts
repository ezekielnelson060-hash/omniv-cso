/**
 * Omniv email identity + stream configuration (Resend).
 *
 * Domains (configure in Resend + DNS):
 *   notify.omniv.media  — transactional (auth, security, activity)
 *   updates.omniv.media — marketing / nurture / product news
 *
 * Env overrides (optional):
 *   RESEND_FROM_NOTIFY   e.g. Omniv <hello@notify.omniv.media>
 *   RESEND_FROM_UPDATES  e.g. Omniv <updates@updates.omniv.media>
 *   RESEND_FROM          legacy single from (fallback)
 */

export type EmailStream = "notify" | "updates";

export type EmailIdentity =
  | "hello"
  | "accounts"
  | "security"
  | "notifications"
  | "updates"
  | "support";

const IDENTITY_META: Record<
  EmailIdentity,
  { local: string; purpose: string; stream: EmailStream }
> = {
  hello: {
    local: "hello",
    purpose: "Welcome emails",
    stream: "notify",
  },
  accounts: {
    local: "accounts",
    purpose: "Email verification",
    stream: "notify",
  },
  security: {
    local: "security",
    purpose: "Password resets and security alerts",
    stream: "notify",
  },
  notifications: {
    local: "notifications",
    purpose: "Likes, follows and activity",
    stream: "notify",
  },
  updates: {
    local: "updates",
    purpose: "Product announcements and newsletters",
    stream: "updates",
  },
  support: {
    local: "support",
    purpose: "Customer support",
    stream: "notify",
  },
};

/** Resend-verified sending host per stream */
export function streamDomain(stream: EmailStream): string {
  if (stream === "updates") {
    return process.env.RESEND_DOMAIN_UPDATES || "updates.omniv.media";
  }
  return process.env.RESEND_DOMAIN_NOTIFY || "notify.omniv.media";
}

/**
 * Build From header for an identity.
 * Prefer stream subdomain (notify.omniv.media) once DNS is verified.
 * Falls back to @omniv.media if RESEND_USE_APEX=1 (legacy).
 */
export function fromAddress(identity: EmailIdentity): string {
  const meta = IDENTITY_META[identity];
  const stream = meta.stream;

  if (stream === "notify" && process.env.RESEND_FROM_NOTIFY) {
    // Allow full override; still use identity display when possible
    return process.env.RESEND_FROM_NOTIFY;
  }
  if (stream === "updates" && process.env.RESEND_FROM_UPDATES) {
    return process.env.RESEND_FROM_UPDATES;
  }
  if (process.env.RESEND_FROM && process.env.RESEND_USE_APEX === "1") {
    return process.env.RESEND_FROM;
  }

  const useApex = process.env.RESEND_USE_APEX === "1";
  const domain = useApex ? "omniv.media" : streamDomain(stream);
  const display =
    identity === "hello"
      ? "Omniv"
      : identity === "security"
        ? "Omniv Security"
        : identity === "accounts"
          ? "Omniv Accounts"
          : identity === "notifications"
            ? "Omniv"
            : identity === "updates"
              ? "Omniv"
              : "Omniv Support";

  return `${display} <${meta.local}@${domain}>`;
}

export function identityPurpose(identity: EmailIdentity): string {
  return IDENTITY_META[identity].purpose;
}

export const EMAIL_IDENTITIES = IDENTITY_META;
