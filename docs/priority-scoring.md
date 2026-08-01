# CRM priority scoring (reference)

Impact scores rank Next Steps within P0 / P1 / P2 bands.

```ts
// Simplified excerpt from src/lib/crm-priority.ts

if (rosterCount === 0) impact = 95;           // P0 seed roster
if (rosterCount > 0 && fanCount === 0) impact = 90; // P0 share gate
if (fans7d === 0 && fanCount > 0) impact = 72;      // P1 stalled growth
if (fanCount > 0 && fanCount < 50) impact = 70 + min(20, fans7d);
if (superfanPct < 8 && fanCount >= 30) impact = 65;
if (coldPct > 40 && fanCount >= 40) impact = 55;
if (openTasks > 5) impact = 52;
if (openTasks === 0) impact = 48;
// Weekly Ziki review → P2 impact 25

// Sort: P0 before P1 before P2, then higher impact first. Take top 4.
```

Fan tiers (nightly cron `/api/cron/fan-tiers`):

```ts
// src/lib/fan-engagement.ts
score >= 50 → Superfan
score >= 21 → Core Fan
score >= 1  → Casual
else        → Cold
// 0.85× decay per 30 days of inactivity
```
