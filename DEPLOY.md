# Deploy status

**Commit:** post-panel fix redeploy trigger

## Modules that were missing (now present)

- `src/components/artist-brain/brain-view.tsx`
- `src/components/content/intelligence-panel.tsx`
- `src/components/crm/crm-panel.tsx`
- `src/components/release/simulator-panel.tsx`
- `src/components/settings/settings-panel.tsx`
- `src/components/ziki/chat-panel.tsx`
- `src/app/(onboarding)/onboarding/page.tsx`

Previous Vercel failures at 20:36–20:38 WAT were from commits **before** these files landed.

`@/*` → `./src/*` is configured in `tsconfig.json`.
