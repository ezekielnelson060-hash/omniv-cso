# Sync remaining source

Route shells, UI kit, billing gates, and core lib are on this repo.

**Still in sandbox (large panels):** dashboard, opportunities, analytics, mock data, Ziki chat, Artist Brain view, CRM panels, Content Intelligence, Release Simulator panel, settings panel, globals.css, landing, auth, onboarding, upgrade-modal, sidebar, etc.

## Fastest full sync

```bash
git clone https://github.com/ezekielnelson060-hash/omniv-cso.git
cd omniv-cso
# Place omniv-cso-full.tar.gz from the build session, then:
tar xzf omniv-cso-full.tar.gz
git add -A && git commit -m "feat: complete Phases 1-6" && git push
```

Or say **continue push** in Grok to keep uploading batches.

Sandbox path: `/home/workdir/artifacts/omniv`  
Tarball: `/home/workdir/artifacts/omniv-cso-full.tar.gz`
