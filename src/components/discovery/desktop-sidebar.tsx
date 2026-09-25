"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AccountSwitcher } from "@/components/discovery/account-switcher";

const NAV: { href: string; label: string; icon: string }[] = [
  { href: "/home", label: "Home", icon: "⌂" },
  { href: "/explore", label: "Explore", icon: "⌕" },
  { href: "/following", label: "Following", icon: "◎" },
  { href: "/saved", label: "Saved", icon: "bookmark" },
  { href: "/activity", label: "Activity", icon: "⚡" },
  { href: "/profile", label: "Profile", icon: "person" },
  { href: "/accounts", label: "Entities", icon: "grid" },
  { href: "/analytics", label: "Analytics", icon: "chart" },
  { href: "/pricing", label: "Upgrade to Pro", icon: "pro" },
];

function NavIcon({ name }: { name: string }) {
  if (name === "bookmark") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 4h12v17l-6-3.5L6 21V4z" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "person") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 19c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "grid") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="4" width="7" height="7" rx="1.5" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" />
      </svg>
    );
  }
  if (name === "chart") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19h16M7 16V9M12 16V5M17 16v-4" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "pro") {
    return <span className="text-[14px]">✦</span>;
  }
  return <span className="w-5 text-center text-[15px]">{name}</span>;
}

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/[0.06] md:block lg:w-72">
      <div className="sticky top-0 flex h-dvh flex-col px-3 py-5">
        <Link href="/home" className="mb-5 flex items-center gap-2.5 px-2">
          <Image
            src="/logo.svg"
            alt="Omniv"
            width={30}
            height={30}
            className="rounded-md"
          />
          <span className="text-[16px] font-semibold tracking-tight text-white">
            Omniv
          </span>
        </Link>

        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/home" && pathname.startsWith(item.href));
            const isPro = item.href === "/pricing";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-full px-3 py-2.5 text-[15px] font-medium transition ${
                  isPro
                    ? "text-omniv-gold hover:bg-omniv-gold/10"
                    : active
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex h-6 w-6 items-center justify-center">
                  <NavIcon name={item.icon} />
                </span>
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/publish"
            className="mt-3 flex items-center justify-center rounded-full bg-omniv-gold py-2.5 text-[14px] font-semibold text-black hover:bg-omniv-gold/90"
          >
            Publish
          </Link>
        </nav>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto border-t border-white/[0.06] pt-3">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
            Accounts
          </p>
          <AccountSwitcher />
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
