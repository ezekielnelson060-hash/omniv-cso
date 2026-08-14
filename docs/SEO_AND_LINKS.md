# SEO + real links checklist (Omniv)

## Already in the product
- `robots.ts` — allows public marketing pages; blocks app shells (`/crm`, `/dashboard`, …)
- `sitemap.ts` — homepage, blog, signup, audit, legal
- Root + page metadata (title, description, OG, canonical)
- JSON-LD Organization / WebSite / SoftwareApplication / FAQ

## After each deploy
1. Search Console → Sitemaps → submit `https://omniv.media/sitemap.xml`
2. URL Inspection → homepage → Request indexing if needed
3. Confirm **canonical** is `https://omniv.media` (not `www`) everywhere

## Share real links (ranking + discovery)
Do these in order of effort/impact:

1. **Your own profiles**
   - X/Twitter bio + pinned post with omniv.media
   - Instagram / TikTok bio (Linktree only if it points to Omniv or Fan Gate)
   - LinkedIn company or personal featured link

2. **Artist bios**
   - When onboarding artists, ask them to put Fan Gate *and* omniv.media in Linktree / bio
   - Each live Fan Gate share is a real referral signal

3. **Product / startup directories** (later)
   - Product Hunt launch
   - BetaList, Indie Hackers, AlternativeTo (vs Bandcamp / Linktree tools)
   - Relevant Subreddits / Discords (value-first posts, not spam)

4. **Content**
   - Ship the 5 blog posts in the sitemap; share each on X with a clear CTA
   - Guest notes or quote cards for other indie-music newsletters

5. **Press / partners**
   - One-pager for labels/managers with omniv.media + case snippet

Backlinks help **rank**. You are already **indexed** without them.

## Keep clean
- One host: `omniv.media` (set `NEXT_PUBLIC_APP_URL=https://omniv.media`)
- Don't put thin `/f/*` gates in the sitemap
- Re-submit sitemap after major public page changes
