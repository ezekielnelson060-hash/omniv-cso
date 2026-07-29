# Supabase Auth + optional OpenAI setup

## 1. Supabase (free tier works)

1. Create a project at https://supabase.com
2. **Authentication → Providers → Email** enabled
3. **Project Settings → API** copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Vercel → Project → Settings → Environment Variables → add both for Production + Preview
5. Redeploy

Optional: disable "Confirm email" under Auth → Providers while testing.

## 2. OpenAI (optional — costs money)

| | |
|--|--|
| **Without key** | Ziki uses free local mock briefings |
| **With `OPENAI_API_KEY`** | Live replies via `gpt-4o-mini` by default |

Rough cost (gpt-4o-mini): ~$0.15 / 1M input tokens, ~$0.60 / 1M output.
A short Ziki briefing is typically a fraction of a cent.

Add in Vercel env (server-only, no `NEXT_PUBLIC_`):
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

## 3. Auth behaviour

- Middleware protects app routes when Supabase env is set
- Login / signup call `supabase.auth`
- Without env vars, login still routes to dashboard (dev fallback)
