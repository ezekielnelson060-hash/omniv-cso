"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/home", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/following", label: "Following" },
  { href: "/saved", label: "Saved" },
  { href: "/activity", label: "Activity" },
  { href: "/publish", label: "Publish" },
  { href: "/profile", label: "Profile" },
] as const;

const EXPLORE = [
  { href: "/explore?type=article", label: "Articles" },
  { href: "/explore?type=music", label: "Music" },
  { href: "/explore?type=research", label: "Research" },
  { href: "/explore?type=product", label: "Products" },
  { href: "/explore?type=event", label: "Events" },
  { href: "/explore?type=opportunity", label: "Opportunities" },
] as const;

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-white/5 md:block lg:w-60">
      <div className="sticky top-0 flex h-dvh flex-col px-3 py-5">
        <Link href="/home" className="mb-6 flex items-center gap-2 px-2">
          <Image
            src="/logo.svg"
            alt="Omniv"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-[15px] font-semibold text-white">Omniv</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/home" && pathname.startsWith(item.href));
            const isPublish = item.href === "/publish";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2.5 text-[14px] font-medium transition ${
                  isPublish
                    ? "mt-2 bg-omniv-gold text-center text-black hover:bg-omniv-gold/90"
                    : active
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
            Browse
          </p>
          <div className="mt-2 flex flex-col gap-0.5">
            {EXPLORE.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-1.5 text-[13px] text-zinc-500 transition hover:text-zinc-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

/** Wrap page content: sidebar on md+ */
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
