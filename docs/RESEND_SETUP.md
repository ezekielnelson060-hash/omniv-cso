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

### DNS in Resend

1. Resend → **Domains** → **Add Domain**
2. Add `notify.omniv.media`
3. Copy the **exact** DNS records Resend shows (SPF, DKIM, optional DMARC)
4. Add them at your DNS host (Hostinger, Cloudflare, etc.)
5. Wait until status is **Verified**
6. Repeat for `updates.omniv.media` when ready

Do **not** invent SPF/DKIM values. Guide: https://resend.com/docs/dashboard/domains/introduction

Until subdomains are verified, you can temporarily send from apex:

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
| Forgot password | Supabase recovery email (+ optional branded) | `security` |
| Helpers ready | Password changed, new login alert | `security` |

Code: `src/lib/email/account.ts`, `src/lib/email/config.ts`, `src/lib/email/send.ts`

### Growth / nurture (updates)

12-email sequence over 60 days (`src/lib/email.ts`), from **updates** identity, daily cron `/api/cron/nurture`.

### Still to wire (next)

- Engagement: follow, interaction, publish success, weekly summary → `notifications@`
- Growth digests: recommended publishers, feature announcements → `updates@`
- Supabase Auth SMTP → point at Resend so **verify email** and **reset password** links come from `accounts@` / `security@` on **notify.omniv.media**

## 5. Supabase Auth + Resend (transactional links)

For real **verify email** and **password reset** links:

1. Verify `notify.omniv.media` in Resend
2. Supabase → **Project Settings → Authentication → SMTP**
3. Use Resend SMTP (host/user/pass from Resend docs)
4. Sender: `Omniv Accounts <accounts@notify.omniv.media>` or security for resets

## 6. Test

```bash
# Welcome (must be signed in)
curl -X POST https://omniv.media/api/email/welcome -H "Cookie: …"

# Password reset request
curl -X POST https://omniv.media/api/email/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"you@email.com"}'

# Nurture day (cron secret)
curl -X POST https://omniv.media/api/email/nurture \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"to":"you@email.com","day":2,"name":"Ezekiel"}'
```

## Priority order

1. **notify.omniv.media** DNS + verify in Resend  
2. Welcome (`hello@`) + Supabase SMTP for verify/reset  
3. **updates.omniv.media** + nurture sequence  
4. Engagement notifications  
