"use client";

import Link from "next/link";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { CurrentIdentityBanner } from "@/components/discovery/current-identity";

const SECTIONS = [
  {
    title: "Account",
    items: [
      { href: "/profile", label: "Personal profile", desc: "Name, photo, bio" },
      {
        href: "/accounts/switch",
        label: "Switch identity",
        desc: "Personal and entity accounts",
      },
      {
        href: "/publish",
        label: "Create entity",
        desc: "Company, artist, product, project",
      },
    ],
  },
  {
    title: "Growth",
    items: [
      { href: "/analytics", label: "Analytics", desc: "Views, follows, heat" },
      { href: "/promote", label: "Promote", desc: "Run discovery campaigns" },
      { href: "/verify", label: "Get verified", desc: "Verified publisher badge" },
    ],
  },
  {
    title: "Billing",
    items: [
      { href: "/pro", label: "Pro", desc: "Analytics + verification" },
      { href: "/pricing", label: "Plans", desc: "Free, Pro, Business" },
    ],
  },
  {
    title: "Support",
    items: [
      { href: "/help", label: "Help", desc: "Guides and answers" },
      {
        href: "/policy",
        label: "Policies",
        desc: "Privacy and terms",
      },
    ],
  },
];

export default function SettingsPage() {
  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 md:max-w-2xl">
            <Link
              href="/home"
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5"
            >
              ←
            </Link>
            <h1 className="text-[16px] font-semibold text-white">Settings</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg space-y-8 px-4 pb-28 pt-5 md:max-w-2xl">
          <CurrentIdentityBanner action="Settings apply to" />

          {SECTIONS.map((section) => (
            <section key={section.title}>
              <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                {section.title}
              </p>
              <div className="overflow-hidden rounded-2xl bg-white/[0.03]">
                {section.items.map((item, i) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-white/[0.04] ${
                      i > 0 ? "border-t border-white/[0.05]" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium text-white">
                        {item.label}
                      </p>
                      <p className="text-[12px] text-zinc-500">{item.desc}</p>
                    </div>
                    <span className="text-zinc-600">›</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          <p className="px-1 text-center text-[11px] text-zinc-600">
            Omniv discovery network · omniv.media
          </p>
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
