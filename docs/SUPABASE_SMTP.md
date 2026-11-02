# Supabase Auth → Resend SMTP

This makes **confirm signup**, **password reset**, **magic link**, and **email change** emails send from your domain instead of `noreply@mail.app.supabase.io`.

Prerequisite: **`notify.omniv.media` verified in Resend** (see `docs/RESEND_SETUP.md`).

---

## 1. Resend SMTP credentials

| Field | Value |
|-------|--------|
| **Host** | `smtp.resend.com` |
| **Port** | `465` (SSL) or `587` (STARTTLS) |
| **Username** | `resend` |
| **Password** | Your Resend API key (`re_…`) |

Source: [Resend + Supabase SMTP](https://resend.com/docs/send-with-supabase-smtp)

---

## 2. Supabase dashboard steps

1. Open your Supabase project
2. Go to **Authentication** → **Emails** (or **Project Settings → Authentication**)
3. Open **SMTP Settings**
4. Enable **Custom SMTP**
5. Fill in:

| Field | Recommended value |
|-------|-------------------|
| **Sender email** | `accounts@notify.omniv.media` |
| **Sender name** | `Omniv Accounts` |
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Username** | `resend` |
| **Password** | `re_…` (same as `RESEND_API_KEY`) |
| **Minimum TLS** | TLS 1.2 |

6. **Save**

Notes:
- Sender email **must** be on a domain verified in Resend.
- One SMTP sender is used for all Auth templates (confirm, reset, magic link). Using `accounts@` is fine for all of them; the in-app branded templates still use `security@` for security alerts via the API.

---

## 3. Redirect URLs (required)

In Supabase → **Authentication** → **URL Configuration**:

**Site URL**
```
https://omniv.media
```

**Redirect URLs** (add all that apply):
```
https://omniv.media/**
https://omniv.media/reset-password
https://omniv.media/login
https://omniv.media/explore
https://omniv.media/publish
http://localhost:3000/**
http://localhost:3000/reset-password
```

App code already uses:
- Signup confirm → `emailRedirectTo` = origin + dest (e.g. `/publish`)
- Password reset → `redirectTo` = `{origin}/reset-password`

---

## 4. Auth email templates (optional polish)

Supabase → **Authentication** → **Email Templates**

You can keep defaults. Optional subject lines:

| Template | Subject |
|----------|---------|
| Confirm signup | Confirm your Omniv email |
| Reset password | Reset your Omniv password |
| Magic link | Your Omniv sign-in link |
| Change email | Confirm your new Omniv email |

Body can stay Supabase defaults (they include the secure `{{ .ConfirmationURL }}`). Do **not** remove that variable.

---

## 5. Rate limits

After custom SMTP is on, raise Auth rate limits if needed:

**Authentication → Rate Limits**

Default after custom SMTP is higher than the free Supabase mailer (which is ~2–4/hour). Still start conservatively in production.

---

## 6. Test checklist

1. **Password reset**
   - Open https://omniv.media/forgot-password
   - Submit a real account email
   - Inbox should show From: `Omniv Accounts <accounts@notify.omniv.media>`
   - Link opens `/reset-password` → set new password → lands in app

2. **Signup confirm** (if “Confirm email” is enabled in Auth settings)
   - Create a new account
   - Confirm email arrives from `accounts@notify.omniv.media`
   - Link confirms and session works

3. **Resend dashboard**
   - **Emails** log shows the message under your domain

---

## 7. Relationship to Omniv Resend API emails

| Channel | Who sends | From |
|---------|-----------|------|
| Supabase Auth (confirm, reset link) | Supabase via SMTP | `accounts@notify.omniv.media` |
| Welcome, nurture, engagement | Omniv API → Resend HTTP | `hello@` / `updates@` / `notifications@` |
| Optional branded reset *notice* | Omniv API if `RESEND_PASSWORD_RESET_BRANDED=1` | `security@` (no secure token) |

You do **not** need the branded Resend notice once SMTP is live — Supabase’s email already has the real link.

---

## 8. Troubleshooting

| Symptom | Fix |
|---------|-----|
| Still from `@mail.app.supabase.io` | Custom SMTP not saved, or domain not verified in Resend |
| Bounce / not delivered | Check Resend domain status + DNS; check Resend logs |
| Link goes to wrong host | Add exact redirect URL in Supabase URL config |
| “Email rate limit exceeded” | Enable custom SMTP; raise rate limits |
| Reset page says invalid session | Open link in same browser; ensure `/reset-password` is allowed redirect |
