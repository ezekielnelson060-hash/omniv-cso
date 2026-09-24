"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ active?: boolean }> | null;
  primary?: boolean;
};

const ITEMS: NavItem[] = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/explore", label: "Explore", icon: ExploreIcon },
  { href: "/publish", label: "Publish", icon: null, primary: true },
  { href: "/saved", label: "Saved", icon: SavedIcon },
  { href: "/activity", label: "Activity", icon: ActivityIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0a0a0a]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-around px-2">
        {ITEMS.map((item) => {
          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label="Publish"
                className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-omniv-gold text-black shadow-lg shadow-omniv-gold/20 transition hover:bg-omniv-gold/90"
              >
                <PlusIcon />
              </Link>
            );
          }
          const active =
            pathname === item.href ||
            (item.href !== "/home" && pathname.startsWith(item.href));
          const Icon = item.icon;
          if (!Icon) return null;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                active ? "text-omniv-gold" : "text-zinc-500"
              }`}
            >
              <Icon active={active} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" strokeLinejoin="round" />
    </svg>
  );
}

function ExploreIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      {active && <circle cx="11" cy="11" r="3" fill="currentColor" stroke="none" />}
    </svg>
  );
}

function SavedIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-3.5L5 20V5a1 1 0 0 1 1-1z" strokeLinejoin="round" />
    </svg>
  );
}

function ActivityIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" opacity={active ? 1 : 0.6} />
      <circle cx="12" cy="12" r="4" fill={active ? "currentColor" : "none"} />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}
