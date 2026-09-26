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

type NavItem = { href: string; label: string };
type NavGroup = { id: string; label: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    id: "home",
    label: "Home",
    items: [
      { href: "/home", label: "Home" },
      { href: "/explore", label: "Explore" },
      { href: "/following", label: "Following" },
      { href: "/saved", label: "Saved" },
    ],
  },
  {
    id: "publish",
    label: "Publish",
      items: [
      { href: "/publications", label: "Publications" },
      { href: "/drafts", label: "Drafts" },
    ],
  },
  {
    id: "grow",
    label: "Grow",
    items: [
      { href: "/analytics", label: "Analytics" },
      { href: "/promote", label: "Promote" },
      { href: "/verify", label: "Get Verified" },
    ],
  },
  {
    id: "monetize",
    label: "Monetize",
    items: [
      { href: "/pricing", label: "Pro" },
      { href: "/explore?type=opportunity", label: "Opportunities" },
    ],
  },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [displayName, setDisplayName] = useState("You");
  const [handle, setHandle] = useState("you");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    home: true,
    publish: true,
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
    <aside className="hidden w-[260px] shrink-0 border-r border-white/[0.06] lg:block xl:w-[280px]">
      <div className="sticky top-0 flex h-dvh flex-col overflow-hidden bg-[#050505]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
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

        {/* Current identity card */}
        <div className="relative px-3 pb-3">
          <button
            type="button"
            onClick={() => setSwitchOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5 text-left ring-1 ring-white/[0.08] transition hover:ring-white/15"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-omniv-gold/20 text-sm font-semibold text-omniv-gold">
              {identityAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={identityAvatar}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                identityName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-[13px] font-semibold text-white">
                {identityName}
                {active?.verified && (
                  <span className="text-sky-400">✓</span>
                )}
              </p>
              <p className="truncate text-[11px] capitalize text-zinc-500">
                {identityType} · @{identityHandle}
              </p>
            </div>
            <span className="text-zinc-500">›</span>
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

        {/* Nav groups */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
          {GROUPS.map((group) => (
            <div key={group.id} className="mb-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[12px] font-semibold uppercase tracking-wide text-zinc-500 hover:text-zinc-300"
              >
                {group.label}
                <span className="text-[10px] opacity-60">
                  {openGroups[group.id] ? "▾" : "▸"}
                </span>
              </button>
              {openGroups[group.id] && (
                <div className="space-y-0.5 pb-2">
                  {group.items.map((item) => {
                    const activeNav =
                      pathname === item.href ||
                      (item.href !== "/home" &&
                        item.href !== "/publish" &&
                        pathname.startsWith(item.href.split("?")[0]));
                    const isHomeExact =
                      item.href === "/home" && pathname === "/home";
                    const isPro = item.label === "Pro";
                    const isActive =
                      item.href === "/home" ? isHomeExact : activeNav;

                    return (
                      <Link
                        key={`${group.id}-${item.label}`}
                        href={item.href}
                        className={`relative flex items-center rounded-lg py-2 pl-4 pr-3 text-[14px] font-medium transition ${
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
                        {item.label}
                        {isPro && (
                          <span className="ml-auto rounded-full bg-omniv-gold/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-omniv-gold">
                            New
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          <div className="mb-1">
            <p className="px-3 py-2 text-[12px] font-semibold uppercase tracking-wide text-zinc-500">
              Identity
            </p>
            <button
              type="button"
              onClick={() => setSwitchOpen(true)}
              className="flex w-full items-center rounded-lg py-2 pl-4 pr-3 text-[14px] font-medium text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            >
              Switch identity
            </button>
            <Link
              href={active ? `${active.path}/edit` : "/accounts"}
              className="flex items-center rounded-lg py-2 pl-4 pr-3 text-[14px] font-medium text-zinc-400 hover:bg-white/[0.04] hover:text-white"
            >
              Manage entity
            </Link>
          </div>
        </nav>

        {/* + Publish */}
        <div className="px-3 pb-3">
          <Link
            href="/publish"
            className="flex h-11 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black transition hover:bg-omniv-gold/90"
          >
            + Publish
          </Link>
        </div>

        {/* Personal account footer */}
        <div className="border-t border-white/[0.06] px-3 py-3">
          <Link
            href="/profile"
            className="flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-white/[0.04]"
          >
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/10 text-[11px] font-semibold text-white">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-white">
                {displayName}
              </p>
              <p className="text-[10px] text-zinc-600">Personal account</p>
            </div>
            <Link
              href="/accounts"
              className="text-zinc-600 hover:text-white"
              title="Settings"
            >
              ⚙
            </Link>
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
