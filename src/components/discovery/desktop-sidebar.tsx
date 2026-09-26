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
    id: "home",
    label: "Home",
    items: [
      { href: "/home", label: "Home", icon: "⌂" },
      { href: "/explore", label: "Explore", icon: "⌕" },
      { href: "/following", label: "Following", icon: "◎" },
      { href: "/saved", label: "Saved", icon: "bookmark" },
    ],
  },
  {
    id: "grow",
    label: "Grow",
    items: [
      { href: "/analytics", label: "Analytics", icon: "chart" },
      { href: "/promote", label: "Promote", icon: "boost" },
      { href: "/verify", label: "Get Verified", icon: "check" },
    ],
  },
  {
    id: "monetize",
    label: "Monetize",
    items: [
      { href: "/pro", label: "Pro", badge: "Popular", icon: "star" },
      { href: "/pricing", label: "Business", icon: "bag" },
      {
        href: "/explore?type=opportunity",
        label: "Opportunities",
        icon: "spark",
      },
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
    case "◎":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="16" cy="9" r="2.5" />
          <path d="M3 19c1.2-3 3.5-4.5 6-4.5s4.8 1.5 6 4.5" strokeLinecap="round" />
          <path d="M14 14.5c1.2-.8 2.6-1.2 4-1.2 1.5 0 2.8.4 3.8 1.2" strokeLinecap="round" opacity={0.7} />
        </svg>
      );
    case "bookmark":
      return (
        <svg {...common}>
          <path d="M7 3.5h10a1 1 0 0 1 1 1V21l-6-3.2L6 21V4.5a1 1 0 0 1 1-1z" strokeLinejoin="round" />
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
    case "bag":
      return (
        <svg {...common}>
          <path d="M6 8h12l-1 12H7L6 8z" strokeLinejoin="round" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
        </svg>
      );
    case "spark":
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.5 2.5M16 16l2.5 2.5M18.5 5.5 16 8M8 16l-2.5 2.5" strokeLinecap="round" />
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
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    home: true,
    grow: true,
    monetize: true,
  });

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

  function toggleGroup(id: string) {
    setOpenGroups((g) => ({ ...g, [id]: !g[id] }));
  }

  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-white/[0.05] lg:block xl:w-[280px]">
      <div className="sticky top-0 flex h-dvh flex-col overflow-hidden bg-[#050505]">
        <div className="flex items-center gap-2.5 px-5 pb-4 pt-5">
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
            <span className="text-zinc-600">›</span>
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
            <div key={group.id} className="mb-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600 hover:text-zinc-400"
              >
                {group.label}
                <span className="text-[10px] opacity-60">
                  {openGroups[group.id] ? "▾" : "▸"}
                </span>
              </button>
              {openGroups[group.id] && (
                <div className="space-y-0.5 pb-2">
                  {group.items.map((item) => {
                    const base = item.href.split("?")[0];
                    const isHomeExact =
                      item.href === "/home" && pathname === "/home";
                    const isActive =
                      item.href === "/home"
                        ? isHomeExact
                        : pathname === item.href ||
                          (base !== "/home" && pathname.startsWith(base));
                    const isPro = item.label === "Pro";

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
              )}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.05] px-3 py-3">
          <Link
            href="/settings"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${
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
          <Link
            href={active?.path || "/profile"}
            className="mt-1 flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-white/[0.04]"
          >
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/10">
              {identityAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={identityAvatar}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-white">
                  {identityName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-white">
                {identityName}
              </p>
              <p className="text-[10px] capitalize text-zinc-600">
                {identityType}
              </p>
            </div>
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
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
