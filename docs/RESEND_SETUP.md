# Resend setup — Omniv nurture emails (12 over 60 days)

## Sequence

| # | Day | Subject |
|---|-----|---------|
| 1 | 0 | Welcome to Omniv |
| 2 | 2 | Your content deserves more than a temporary appearance |
| 3 | 5 | What should you publish on Omniv? |
| 4 | 8 | Publishing is only half the equation |
| 5 | 12 | Your Omniv profile is more than a profile |
| 6 | 17 | One publication is a start. A library of work is an asset. |
| 7 | 22 | Make your identity stand out. Get verified on Omniv. |
| 8 | 28 | Give your best content more visibility |
| 9 | 35 | Understand how your content performs |
| 10 | 42 | Turn your Omniv presence into a growth channel |
| 11 | 50 | Your next opportunity to be discovered starts with publishing |
| 12 | 60 | Your next chapter on Omniv |

Copy lives in `src/lib/email.ts`. From address: `Omniv <onboarding@omniv.media>`.

## 1. Resend account & domain
1. [resend.com](https://resend.com) → Domains → `omniv.media`
2. Add SPF / DKIM (and DMARC if prompted) until **Verified**
3. API Keys → create key (`re_…`)

## 2. Vercel env vars
```
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM=Omniv <onboarding@omniv.media>
CRON_SECRET=some-long-random-string
```
Redeploy after saving.

## 3. Automation
- **Day 0:** `POST /api/email/welcome` after signup (also callable manually)
- **Days 2–60:** daily cron
  - `GET /api/cron/nurture` (dedicated)
  - also runs inside `/api/cron/market-news`

Vercel cron entry:
```json
{ "path": "/api/cron/nurture", "schedule": "0 10 * * *" }
```

## 4. Test a single email
```bash
curl -X POST https://omniv.media/api/email/nurture \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"to":"you@email.com","day":0,"name":"Ezekiel"}'
```

Valid days: `0, 2, 5, 8, 12, 17, 22, 28, 35, 42, 50, 60`.

## 5. Behavioural follow-ups (next layer)
The base sequence is time-based. Later: suppress verification emails if already verified, tip promotion to publishers with content, analytics to active publishers. Do not re-pitch verification after purchase.
