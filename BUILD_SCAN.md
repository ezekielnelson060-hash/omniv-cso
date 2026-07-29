# Build scan (static) — 2026-07-29

## Status
- **Missing @/ imports:** 0
- **Missing "use client" on hook components:** 0
- **node_modules:** not installed in sandbox (no internet) — full `next build` not run here
- **Fixed this pass:**
  - Removed unused `scoreBg` import from `score-card.tsx`
  - App shell: `md:ml-[240px]` + responsive padding (was always 240px margin)

## Notes (non-blocking)
1. **Sidebar mobile:** still fixed 240px sidebar with no drawer/hamburger — main content now full-width on small screens but sidebar may overlay. Add mobile nav drawer in polish.
2. **recharts / framer-motion:** listed in package.json but charts are custom SVG (`ChartLine`, `MiniSparkline`). Safe to keep for later or remove to shrink install.
3. **Supabase / OpenAI:** client stubs only — Auth and Ziki live API still Phase polish.
4. **Flutterwave:** preserved in `phase6.ts` + Settings/billing copy; no Stripe swap.
5. **Next 16 / React 19:** package.json targets modern stack — verify on your machine with `npm i && npm run build`.

## Remaining files to push (heavy panels)
- src/data/mock.ts
- simulator-panel, chat-panel, crm-panel, settings-panel, brain-view
- onboarding page, intelligence-panel

## Local verify
```bash
npm install
npm run build
npm run lint
```
