"use client";

import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { NotificationBell } from "@/components/discovery/notification-bell";

type Row = { href: string; label: string; hint?: string };
type Group = { title: string; rows: Row[] };

const GROUPS: Group[] = [
  {
    title: "Account",
    rows: [
      { href: "/profile", label: "Profile" },
      { href: "/settings/account", label: "Personal information" },
      { href: "/settings/account", label: "Username" },
      { href: "/settings/account", label: "Email & phone" },
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
        label: "Push, email & quiet hours",
        hint: "Granular controls",
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
    rows: [
      { href: "/settings/appearance", label: "Theme", hint: "Dark" },
    ],
  },
  {
    title: "Monetization",
    rows: [
      { href: "/pro", label: "Subscription" },
      { href: "/settings/billing", label: "Billing & invoices" },
      { href: "/settings/billing", label: "Payment methods" },
    ],
  },
  {
    title: "Verification",
    rows: [
      { href: "/verify", label: "Verification status" },
      { href: "/verify", label: "Identity verification" },
    ],
  },
  {
    title: "Security",
    rows: [
      { href: "/settings/security", label: "Two-factor authentication" },
      { href: "/settings/security", label: "Active sessions" },
      { href: "/settings/security", label: "Connected accounts" },
    ],
  },
  {
    title: "Danger zone",
    rows: [
      { href: "/settings/danger", label: "Deactivate account" },
      { href: "/settings/danger", label: "Delete account" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-2xl">
            <h1 className="text-[17px] font-semibold text-white">Settings</h1>
            <NotificationBell />
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4 md:max-w-2xl">
          <p className="mb-6 text-[13px] text-zinc-500">
            Configuration grouped by function — not a dumping ground.
          </p>

          {GROUPS.map((g) => (
            <section key={g.title} className="mb-7">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                {g.title}
              </p>
              <ul className="overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
                {g.rows.map((row, i) => (
                  <li key={`${g.title}-${row.label}-${i}`}>
                    <Link
                      href={row.href}
                      className={`flex items-center justify-between px-4 py-3.5 transition hover:bg-white/[0.04] ${
                        i > 0 ? "border-t border-white/[0.05]" : ""
                      } ${
                        g.title === "Danger zone"
                          ? "text-red-400"
                          : "text-white"
                      }`}
                    >
                      <span className="text-[14px] font-medium">{row.label}</span>
                      <span className="flex items-center gap-2 text-[12px] text-zinc-600">
                        {row.hint}
                        <span aria-hidden>›</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <p className="mt-4 text-center text-[12px] text-zinc-600">
            Help Center · Contact support
          </p>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
