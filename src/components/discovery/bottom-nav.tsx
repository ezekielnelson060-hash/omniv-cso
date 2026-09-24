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
    <nav className="fixed inset-x-0 bottom-0 z-50 bg-[#0a0a0a]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      {/* soft top edge — no hard line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="mx-auto flex h-[64px] max-w-lg items-end justify-around px-1 pb-2">
        {ITEMS.map((item) => {
          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label="Create"
                className="relative -top-4 flex h-[56px] w-[56px] items-center justify-center rounded-full bg-omniv-gold text-black shadow-[0_8px_24px_rgba(212,175,55,0.35)] transition active:scale-95"
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
              className={`flex min-w-[56px] flex-col items-center gap-0.5 py-1 transition ${
                active ? "text-omniv-gold" : "text-zinc-500"
              }`}
            >
              <Icon active={active} />
              <span
                className={`text-[10px] font-medium ${
                  active ? "text-omniv-gold" : "text-zinc-500"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-5.5H10V21H5a1 1 0 0 1-1-1v-9.5z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExploreIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <circle cx="11" cy="11" r="7.5" />
      <path d="m20 20-3.2-3.2" strokeLinecap="round" />
      {active && (
        <circle cx="11" cy="11" r="2.5" fill="currentColor" stroke="none" />
      )}
    </svg>
  );
}

function SavedIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path
        d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-3.2L6 21V4.5a1 1 0 0 1 1-1z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ActivityIcon({ active }: { active?: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <circle cx="12" cy="12" r="3.2" fill={active ? "currentColor" : "none"} />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M5.4 18.6l1.6-1.6M17 7l1.6-1.6"
        strokeLinecap="round"
        opacity={active ? 1 : 0.85}
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
    >
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}
