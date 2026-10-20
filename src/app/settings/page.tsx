"use client";

import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";

type Row = { href: string; label: string; hint?: string };

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: "Account",
    rows: [
      { href: "/profile", label: "Profile" },
      { href: "/settings/account", label: "Personal information" },
      { href: "/settings/username", label: "Username" },
      { href: "/settings/account", label: "Email" },
      { href: "/settings/security", label: "Password & security" },
    ],
  },
  {
    title: "Network",
    rows: [
      { href: "/following", label: "Following" },
      { href: "/settings/network", label: "Blocked accounts" },
      { href: "/settings/network", label: "Discoverability" },
    ],
  },
  {
    title: "Notifications",
    rows: [
      {
        href: "/settings/notifications",
        label: "Push, email & in-app",
      },
    ],
  },
  {
    title: "Privacy",
    rows: [
      { href: "/settings/privacy", label: "Who can contact me" },
      { href: "/settings/privacy", label: "Who can follow me" },
      { href: "/settings/privacy", label: "Publications visibility" },
      { href: "/settings/privacy", label: "Profile & search visibility" },
    ],
  },
  {
    title: "Publishing",
    rows: [
      { href: "/settings/publishing", label: "Default publishing identity" },
      { href: "/settings/publishing", label: "Comments & defaults" },
      { href: "/settings/publishing", label: "Download permissions" },
    ],
  },
  {
    title: "Appearance",
    rows: [{ href: "/settings/appearance", label: "Theme", hint: "Dark" }],
  },
  {
    title: "Creator tools",
    rows: [
      { href: "/leads", label: "Leads", hint: "Pro" },
      { href: "/analytics", label: "Analytics", hint: "Pro" },
      { href: "/settings/team", label: "Team seats", hint: "Business" },
    ],
  },
  {
    title: "Billing",
    rows: [
      { href: "/pro", label: "Subscription" },
      { href: "/settings/billing", label: "Billing & invoices" },
      { href: "/settings/billing", label: "Payment methods" },
    ],
  },
  {
    title: "Verification",
    rows: [
      { href: "/verify", label: "Get verified", hint: "Own your identity" },
      { href: "/verify", label: "Verification status" },
    ],
  },
  {
    title: "Security",
    rows: [
      { href: "/settings/security", label: "Two-factor authentication" },
      { href: "/settings/security", label: "Active sessions" },
      { href: "/settings/danger", label: "Delete account", hint: "Danger" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#050505]/95 px-4 py-3 backdrop-blur">
          <h1 className="mx-auto max-w-lg text-[17px] font-semibold text-white md:max-w-2xl">
            Settings
          </h1>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4 md:max-w-2xl">
          {SECTIONS.map((s) => (
            <section key={s.title} className="mb-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                {s.title}
              </p>
              <ul className="overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.06]">
                {s.rows.map((r) => (
                  <li key={r.href + r.label} className="border-b border-white/[0.04] last:border-0">
                    <Link
                      href={r.href}
                      className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-white/[0.03]"
                    >
                      <span className="text-[14px] text-white">{r.label}</span>
                      {r.hint ? (
                        <span className="text-[12px] text-zinc-500">{r.hint}</span>
                      ) : (
                        <span className="text-zinc-600">→</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
