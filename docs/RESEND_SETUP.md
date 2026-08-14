# Resend setup for Omniv nurture emails

## 1. Create account
1. Go to [https://resend.com](https://resend.com) and sign up
2. Verify your account

## 2. Add domain (production)
1. Resend → Domains → Add domain
2. Add `omniv.media` (or your sending subdomain e.g. `mail.omniv.media`)
3. Add the DNS records Resend shows (SPF, DKIM, optionally DMARC)
4. Wait until status is **Verified**

For testing only, you can use Resend’s onboarding sender: `beth.t@example.com` (limited to your own email).

## 3. API key
1. Resend → API Keys → Create
2. Copy the key (starts with `re_`)

## 4. Vercel env vars
Add to the Omniv project on Vercel:

```
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM=Omniv <onboarding@omniv.media>
CRON_SECRET=some-long-random-string
```

Redeploy after saving.

## 5. Test send
```bash
curl -X POST https://omniv.media/api/email/nurture \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"to":"you@email.com","day":0,"name":"Ezekiel"}'
```

Days available: 0, 2, 4, 7, 10, 14, 21, 30 (see `src/lib/email.ts`).

## 6. Automate (next step)
- On signup: call day 0 from your auth/signup success path
- Daily cron (Vercel Cron or Supabase): select users by signup age and fire the matching day
- Store `last_nurture_day` on profiles to avoid duplicates

Sequence copy lives in `src/lib/email.ts` — edit there to change tone or CTAs.
