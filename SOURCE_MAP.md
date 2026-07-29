# Full source map (Omniv CSO Next.js)

Phases 1–6 built in sandbox. Foundation files are on this repo; remaining modules listed below will follow on subsequent pushes (or extract `omniv-cso-full.tar.gz` from the build environment).

## On GitHub now

- package.json, tsconfig, next.config, postcss, eslint, README
- src/lib/utils.ts, providers, app-shell
- src/app/(app)/artist-brain/page.tsx

## Full tree (62 files)

- README.md
- package.json / tsconfig.json / next.config.ts / postcss.config.mjs / eslint.config.mjs
- src/app/layout.tsx, globals.css, page.tsx
- src/app/(app)/dashboard, opportunities, analytics, ziki, artist-brain, content, release-simulator, crm, label, reports, notifications, settings, help
- src/app/(auth)/login, signup, forgot-password
- src/app/(onboarding)/onboarding
- src/components/** (billing gates, UI, CRM, Ziki, etc.)
- src/data/**, src/lib/billing.ts, src/types

## Pricing

Free / Starter $29 / Pro $59 / Label $179 — Flutterwave preserved.

## Local

```bash
npm install && npm run dev
```
