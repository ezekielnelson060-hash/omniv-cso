# Deployment Checklist

## ✅ Completed
- [x] Next.js 16 + React 19 configuration
- [x] TypeScript strict mode
- [x] Path aliases (@/* → ./src/*)
- [x] Vercel cron jobs configured (weekly-scan, fan-tiers)
- [x] Security headers configured
- [x] Component modules restored

## 🔧 Environment Setup
1. Copy `.env.local.example` to `.env.local`
2. Add Supabase credentials
3. Set `CRON_SECRET` to a secure random string
4. Configure authentication callbacks for TikTok, Spotify, Apple Music

## 🚀 Deploy to Vercel
```bash
# Local build verification
npm install
npm run build
npm run lint

# Push to GitHub
git add .
git commit -m "deployment: ready for Vercel"
git push origin main

# Vercel will auto-deploy from main branch
# https://omniv-cso.vercel.app
```

## 📋 Pre-Deployment Checks
- [ ] Environment variables set in Vercel dashboard
- [ ] Supabase database schema migrated
- [ ] OAuth credentials configured (TikTok, Spotify, Apple)
- [ ] Cron jobs enabled in Vercel project settings
- [ ] Domain SSL certificate active

## 🐛 Troubleshooting

### Build Errors
- Verify all @/ imports resolve to ./src/*
- Check that hook components have "use client" directive
- Run `npm run build` locally before pushing

### Cron Job Issues
- Ensure `CRON_SECRET` environment variable is set
- Check Vercel cron logs: https://vercel.com/docs/crons
- Verify endpoint is accessible: `/api/cron/[job-name]`

### Module Not Found
- Clear `.next` cache: `rm -rf .next`
- Reinstall dependencies: `npm ci`
- Verify file paths in tsconfig.json
