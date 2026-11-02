# Omniv email infrastructure (Resend)

Resend is enough for Omniv. Your **backend** triggers the right template at the right event — Resend only delivers.

## 1. Sender identities

| Address | Purpose | Stream |
|---------|---------|--------|
| `hello@…` | Welcome emails | notify |
| `accounts@…` | Email verification | notify |
| `security@…` | Password resets & security alerts | notify |
| `notifications@…` | Likes, follows, activity | notify |
| `updates@…` | Product news, nurture sequence | updates |
| `support@…` | Customer support | notify |

These are **From** identities, not necessarily separate inboxes.

## 2. Domains (isolate reputation)

| Domain | Use |
|--------|-----|
| **notify.omniv.media** | Transactional (auth, security, activity) — **set up first** |
| **updates.omniv.media** | Marketing / nurture / announcements |

### Exact DNS checklist for `notify.omniv.media`

1. Open [Resend Dashboard → Domains](https://resend.com/domains)
2. Click **Add Domain**
3. Enter: `notify.omniv.media`
4. Resend shows records (copy **exactly** — do not invent values):
   - **DKIM** — usually 2–3 `TXT` (or `CNAME`) records with names like `resend._domainkey…`
   - **SPF** — often a `TXT` on `send` (or root of subdomain) containing `v=spf1 include:amazonses.com …`
   - **MX** (optional, for inbound) — only if Resend asks for it
5. At your DNS host (Cloudflare / Hostinger / Namecheap / etc.):
   - Add each record **exactly** as shown (name, type, value, TTL)
   - If using Cloudflare proxy: DNS-only (grey cloud) for these records
6. Back in Resend → click **Verify** (can take a few minutes to 48h)
7. Status must show **Verified** before production sends from `*@notify.omniv.media`

Repeat later for `updates.omniv.media` (marketing stream).

Official guide: https://resend.com/docs/dashboard/domains/introduction

Until subdomains are verified, temporary apex fallback:

```
RESEND_USE_APEX=1
RESEND_FROM=Omniv <onboarding@omniv.media>
```

## 3. Vercel environment variables

```
RESEND_API_KEY=re_xxxxxxxx
CRON_SECRET=long-random-string

# Preferred once notify is verified:
# (code builds From as hello@notify.omniv.media etc.)

# Optional full overrides:
# RESEND_FROM_NOTIFY=Omniv <hello@notify.omniv.media>
# RESEND_FROM_UPDATES=Omniv <updates@updates.omniv.media>
# RESEND_DOMAIN_NOTIFY=notify.omniv.media
# RESEND_DOMAIN_UPDATES=updates.omniv.media

# Optional: also send branded Resend copy on password reset
# (Supabase Auth still owns the secure recovery link)
# RESEND_PASSWORD_RESET_BRANDED=1
```

## 4. What Omniv sends today

### Account (notify)

| Event | Template | Identity |
|-------|----------|----------|
| Signup (session) | Welcome to Omniv | `hello` |
| Forgot password | Supabase recovery → `/reset-password` | SMTP `accounts@` |
| Helpers ready | Password changed, new login alert | `security` |

Code: `src/lib/email/account.ts`, `src/lib/email/config.ts`, `src/lib/email/send.ts`  
Reset UI: `src/app/(auth)/reset-password/page.tsx`

### Engagement (notify · `notifications@`)

| Event | When | Template |
|-------|------|----------|
| Follow | New follow of user/entity | `sendFollowEmail` |
| Like | New like on publication | `sendLikeEmail` |
| Published | Publication status = published | `sendPublishedSuccessEmail` |
| Weekly summary | Monday cron `/api/cron/weekly-summary` | `sendWeeklySummaryEmail` |

Code: `src/lib/email/engagement.ts`, `src/lib/email/notify-engagement.ts`  
Wired from: `api/discovery/follow`, `api/discovery/like`, `api/discovery/publications`

### Growth / nurture (updates)

12-email sequence over 60 days (`src/lib/email/nurture-sequence.ts` + `nurture.ts`), from **updates** identity, daily cron `/api/cron/nurture`.

## 5. Supabase Auth + Resend SMTP

**Full step-by-step:** [`docs/SUPABASE_SMTP.md`](./SUPABASE_SMTP.md)

Quick values after `notify.omniv.media` is verified:

| Field | Value |
|-------|--------|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | your `re_…` API key |
| Sender email | `accounts@notify.omniv.media` |
| Sender name | `Omniv Accounts` |

Also add redirect URL: `https://omniv.media/reset-password`

## 6. Test

```bash
# Welcome (must be signed in)
curl -X POST https://omniv.media/api/email/welcome -H "Cookie: …"

# Password reset request
curl -X POST https://omniv.media/api/email/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"you@email.com"}'

# Nurture day (cron secret)
curl https://omniv.media/api/cron/nurture \
  -H "Authorization: Bearer $CRON_SECRET"

# Weekly summary (cron secret)
curl https://omniv.media/api/cron/weekly-summary \
  -H "Authorization: Bearer $CRON_SECRET"
```

## Priority order

1. **notify.omniv.media** DNS + verify in Resend  
2. Supabase SMTP (this section + `SUPABASE_SMTP.md`)  
3. **updates.omniv.media** + nurture sequence  
4. Engagement notifications (live)  
