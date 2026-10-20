"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { IdentitySwitcher } from "@/components/discovery/identity-switcher";
import { OmnivAvatar } from "@/components/discovery/omniv-avatar";
import { EventReminderWatcher } from "@/components/discovery/event-reminder-watcher";
import { readProfile } from "@/lib/discovery/local-profile";
import {
  readActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";

type NavItem = {
  href: string;
  label: string;
  badge?: string;
  icon: string;
};
type NavGroup = { id: string; label: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    id: "primary",
    label: "",
    items: [
      { href: "/home", label: "Home", icon: "home" },
      { href: "/explore", label: "Explore", icon: "search" },
      { href: "/notifications", label: "Notifications", icon: "bell" },
    ],
  },
  {
    id: "network",
    label: "Your network",
    items: [
      { href: "/following", label: "Following", icon: "following" },
      { href: "/saved", label: "Saved", icon: "bookmark" },
      { href: "/activity", label: "Activity", icon: "activity" },
    ],
  },
  {
    id: "publish",
    label: "Publish",
    items: [
      { href: "/publish", label: "New publication", icon: "plus" },
      { href: "/accounts", label: "Entities", icon: "entities" },
    ],
  },
  {
    id: "grow",
    label: "Grow",
    items: [
      { href: "/analytics", label: "Analytics", icon: "chart" },
      { href: "/promote", label: "Promote", icon: "promote" },
    ],
  },
];

function NavIcon({ name }: { name: string }) {
  const cls = "h-[18px] w-[18px] shrink-0";
  switch (name) {
    case "home":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "search":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      );
    case "bell":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 9a6 6 0 0 1 12 0c0 7 2 7 2 9H4c0-2 2-2 2-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 20a2 2 0 0 0 4 0" strokeLinecap="round" />
        </svg>
      );
    case "following":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="9" cy="8" r="3.5" />
          <path d="M3 19c0-3 2.5-5 6-5s6 2 6 5" strokeLinecap="round" />
          <path d="M17 11h4M19 9v4" strokeLinecap="round" />
        </svg>
      );
    case "bookmark":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.5L6 20V5a1 1 0 0 1 1-1z" strokeLinejoin="round" />
        </svg>
      );
    case "activity":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 12h3l2-6 4 12 2-6h5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "plus":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      );
    case "entities":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "chart":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 19V5M4 19h16" strokeLinecap="round" />
          <path d="M8 16v-5M12 16V8M16 16v-3" strokeLinecap="round" />
        </svg>
      );
    case "promote":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 12h16M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return <span className={cls} />;
  }
}

function DesktopSidebar() {
  const pathname = usePathname() || "/";
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [name, setName] = useState("You");

  useEffect(() => {
    setActive(readActiveAccount());
    setName(readProfile().displayName || "You");
    return onAccountSwitch((a) => {
      setActive(a);
      setName(readProfile().displayName || "You");
    });
  }, []);

  return (
    <aside className="sticky top-0 hidden h-dvh w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-[#080808] px-3 py-4 md:flex">
      <Link href="/home" className="mb-6 flex items-center gap-2 px-2">
        <Image src="/omniv-mark.svg" alt="Omniv" width={28} height={28} className="h-7 w-7" />
        <span className="text-[15px] font-semibold tracking-tight text-white">Omniv</span>
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto">
        {GROUPS.map((g) => (
          <div key={g.id}>
            {g.label ? (
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                {g.label}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const activeNav =
                  pathname === item.href ||
                  (item.href !== "/home" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-2.5 py-2 text-[14px] font-medium transition ${
                        activeNav
                          ? "bg-white/[0.08] text-white"
                          : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <NavIcon name={item.icon} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t border-white/[0.06] pt-3">
        <IdentitySwitcher />
        <Link
          href="/profile"
          className="flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-white/[0.04]"
        >
          <OmnivAvatar
            src={null}
            name={active?.name || name}
            size={32}
          />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-white">
              {active?.name || name}
            </p>
            <p className="truncate text-[11px] text-zinc-500">
              {active ? active.type : "Personal"}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}

export function DiscoveryShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-[#050505] text-zinc-100">
      <EventReminderWatcher />
      <DesktopSidebar />
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1100px] xl:max-w-[1200px]">
          {children}
        </div>
      </div>
      <div className="hidden w-[72px] shrink-0 xl:block" aria-hidden />
    </div>
  );
}
