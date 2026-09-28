"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentType } from "react";
import {
  readActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";
import { PublishSheet } from "@/components/discovery/publish-sheet";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ active?: boolean }> | null;
  primary?: boolean;
};

/** Discovery product nav: Home · Explore · + · Saved · Profile */
const ITEMS: NavItem[] = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/explore", label: "Explore", icon: ExploreIcon },
  { href: "/publish", label: "Publish", icon: null, primary: true },
  { href: "/saved", label: "Saved", icon: SavedIcon },
  { href: "/profile", label: "Profile", icon: ProfileIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    setActive(readActiveAccount());
    return onAccountSwitch((a) => setActive(a));
  }, []);

  useEffect(() => {
    router.prefetch("/publish");
    for (const type of [
      "article",
      "music",
      "video",
      "file",
      "product",
      "event",
      "opportunity",
      "announcement",
      "research",
    ]) {
      router.prefetch(`/publish?type=${type}`);
    }
  }, [router]);

  void active;

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/[0.06] bg-[#050505] pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="mx-auto flex h-[56px] max-w-lg items-center justify-between px-1">
          {ITEMS.map((item) => {
            if (item.primary) {
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  aria-label="Publish"
                  className="-mt-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-omniv-gold text-black shadow-lg shadow-omniv-gold/20 transition active:scale-[0.96]"
                >
                  <PlusIcon />
                </button>
              );
            }
            const activeNav =
              pathname === item.href ||
              (item.href !== "/home" && pathname.startsWith(item.href));
            const Icon = item.icon;
            if (!Icon) return null;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex w-[18%] min-w-0 flex-col items-center gap-0.5 py-1 transition ${
                  activeNav ? "text-white" : "text-zinc-600"
                }`}
              >
                <Icon active={activeNav} />
                <span className="truncate text-[10px] font-medium tracking-wide">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
      <PublishSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"
        stroke={active ? "currentColor" : "currentColor"}
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.15 : 0}
      />
    </svg>
  );
}

function ExploreIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {active && <circle cx="11" cy="11" r="3" fill="currentColor" fillOpacity={0.25} />}
    </svg>
  );
}

function SavedIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.5L6 20V5a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? 0.2 : 0}
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.6" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.2 : 0} />
      <path d="M5 19c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
