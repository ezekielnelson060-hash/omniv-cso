"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { IdentitySwitcher } from "@/components/discovery/identity-switcher";
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
      { href: "/home", label: "Home", icon: "⌂" },
      { href: "/explore", label: "Explore", icon: "⌕" },
      { href: "/notifications", label: "Notifications", icon: "bell" },
    ],
  },
  {
    id: "network",
    label: "Your network",
    items: [
      { href: "/following", label: "Following", icon: "◎" },
      { href: "/saved", label: "Saved", icon: "bookmark" },
      { href: "/activity", label: "Activity", icon: "activity" },
    ],
  },
  {
    id: "publish",
    label: "Publish",
    items: [{ href: "/publish", label: "New publication", icon: "plus" }],
  },
  {
    id: "manage",
    label: "Manage",
    items: [
      { href: "/analytics", label: "Analytics", icon: "chart" },
      { href: "/promote", label: "Promote", icon: "boost" },
      { href: "/accounts", label: "Entities", icon: "entities" },
    ],
  },
  {
    id: "monetize",
    label: "Monetize",
    items: [
      { href: "/pro", label: "Pro & Business", badge: "Plans", icon: "star" },
      { href: "/verify", label: "Get Verified", icon: "check" },
    ],
  },
];

function NavIcon({ name }: { name: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    className: "shrink-0 opacity-80",
  } as const;

  switch (name) {
    case "⌂":
      return (
        <svg {...common}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-5.5H10V21H5a1 1 0 0 1-1-1v-9.5z" strokeLinejoin="round" />
        </svg>
      );
    case "⌕":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" strokeLinecap="round" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M6 9a6 6 0 0 1 12 0c0 7 2 7 2 9H4c0-2 2-2 2-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 20a2 2 0 0 0 4 0" strokeLinecap="round" />
        </svg>
      );
    case "◎":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="16" cy="9" r="2.5" />
          <path d="M3 19c1.2-3 3.5-4.5 6-4.5s4.8 1.5 6 4.5" strokeLinecap="round" />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...common}>
          <path d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-3.2L6 21V4.5a1 1 0 0 1 1-1z" strokeLinejoin="round" />
        </svg>
      );
    case "activity":
      return (
        <svg {...common}>
          <path d="M4 12h4l2-6 4 12 2-6h4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 19h16M7 16V10M12 16V6M17 16v-4" strokeLinecap="round" />
        </svg>
      );
    case "boost":
      return (
        <svg {...common}>
          <path d="M13 3 4 14h7l-1 7 9-11h-7l1-7z" strokeLinejoin="round" />
        </svg>
      );
    case "entities":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="m8.5 12.5 2.2 2.2 4.8-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="m12 3 2.4 5.4 5.8.6-4.4 3.9 1.3 5.7L12 15.8 6.9 18.6l1.3-5.7L3.8 9l5.8-.6L12 3z" strokeLinejoin="round" />
        </svg>
      );
    default:
      return <span className="w-[18px] text-center text-[12px]">·</span>;
  }
}

export function DesktopSidebar() {
  const pathname = usePathname();
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [displayName, setDisplayName] = useState("You");
  const [handle, setHandle] = useState("you");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const p = readProfile();
      setDisplayName(p.displayName || "You");
      setHandle(p.handle || "you");
      setAvatarUrl(p.avatarUrl || null);
      setActive(readActiveAccount());
    } catch {
      /* ignore */
    }
    return onAccountSwitch((a) => setActive(a));
  }, []);

  const identityName = active?.name || displayName;
  const identityType = active
    ? `${active.type}${active.verified ? " · Verified" : ""}`
    : "Personal";
  const identityHandle = active?.handle || active?.slug || handle;
  const identityAvatar = active?.avatarUrl || avatarUrl;

  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-white/[0.05] lg:block xl:w-[280px]">
      <div className="sticky top-0 flex h-dvh flex-col overflow-hidden bg-[#050505]">
        <div className="flex items-center gap-2.5 px-5 pb-3 pt-5">
          <Image
            src="/logo.svg"
            alt="Omniv"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-[15px] font-semibold tracking-tight text-white">
            OMNIV
          </span>
        </div>

        <div className="relative px-3 pb-3">
          <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-600">
            Publishing as
          </p>
          <button
            type="button"
            onClick={() => setSwitchOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.03] px-3 py-2.5 text-left transition hover:bg-white/[0.05]"
          >
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-omniv-gold/20">
              {identityAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={identityAvatar}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-omniv-gold">
                  {identityName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-[13px] font-semibold text-white">
                {identityName}
                {active?.verified && <span className="text-sky-400">✓</span>}
              </p>
              <p className="truncate text-[11px] capitalize text-zinc-500">
                {identityType} · @{identityHandle}
              </p>
            </div>
            <span className="text-zinc-600">▾</span>
          </button>

          {switchOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40"
                aria-label="Close switcher"
                onClick={() => setSwitchOpen(false)}
              />
              <div className="absolute left-3 right-3 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl bg-[#0c0c0c] py-3 shadow-2xl ring-1 ring-white/10">
                <div className="mb-2 flex items-center justify-between px-4">
                  <p className="text-[13px] font-semibold text-white">
                    Switch identity
                  </p>
                  <button
                    type="button"
                    onClick={() => setSwitchOpen(false)}
                    className="text-zinc-500 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <IdentitySwitcher onClose={() => setSwitchOpen(false)} />
              </div>
            </>
          )}
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
          {GROUPS.map((group) => (
            <div key={group.id} className="mb-3">
              {group.label ? (
                <p className="mb-1 px-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                  {group.label}
                </p>
              ) : null}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const base = item.href.split("?")[0];
                  const isHomeExact =
                    item.href === "/home" && pathname === "/home";
                  const isActive =
                    item.href === "/home"
                      ? isHomeExact
                      : pathname === item.href ||
                        (base !== "/home" && pathname.startsWith(base));
                  const isPro = item.label.includes("Pro");

                  return (
                    <Link
                      key={`${group.id}-${item.label}`}
                      href={item.href}
                      className={`relative flex items-center gap-3 rounded-xl py-2.5 pl-3 pr-3 text-[14px] font-medium transition ${
                        isActive
                          ? "bg-white/[0.06] text-white"
                          : isPro
                            ? "text-omniv-gold hover:bg-omniv-gold/10"
                            : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-omniv-gold" />
                      )}
                      <NavIcon name={item.icon} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-omniv-gold px-1.5 py-0.5 text-[9px] font-bold uppercase text-black">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.05] px-3 py-3">
          <Link
            href="/publish"
            className="mb-2 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-omniv-gold text-[14px] font-semibold text-black shadow-lg shadow-omniv-gold/15 transition hover:brightness-110 active:scale-[0.98]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Publish
          </Link>
          <Link
            href={active?.path || "/profile"}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${
              pathname.startsWith("/profile") || pathname.startsWith("/e/")
                ? "bg-white/[0.06] text-white"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white/10">
              {identityAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={identityAvatar}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-white">
                  {identityName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            Profile
          </Link>
          <Link
            href="/settings"
            className={`mt-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${
              pathname.startsWith("/settings")
                ? "bg-white/[0.06] text-white"
                : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="opacity-80"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" strokeLinecap="round" />
            </svg>
            Settings
          </Link>
        </div>
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
