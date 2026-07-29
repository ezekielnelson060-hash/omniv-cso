"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Brain,
  BarChart3,
  Sparkles,
  Rocket,
  Film,
  MessageSquare,
  Users,
  Building2,
  Settings,
  Bell,
  ChevronRight,
  FileText,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Command Center", icon: LayoutDashboard },
  { href: "/ziki", label: "Ziki AI", icon: MessageSquare },
  { href: "/artist-brain", label: "Artist Brain", icon: Brain },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/opportunities", label: "Opportunity Feed", icon: Sparkles },
  { href: "/release-simulator", label: "Release Simulator", icon: Rocket },
  { href: "/content", label: "Content Intelligence", icon: Film },
  { href: "/crm", label: "Manager CRM", icon: Users },
  { href: "/label", label: "Label Dashboard", icon: Building2 },
  { href: "/reports", label: "Reports", icon: FileText },
];

const bottom = [
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/help", label: "Help Centre", icon: HelpCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-widest text-omniv-text-muted">
          Core
        </p>
        {nav.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm transition-all duration-150",
                active
                  ? "bg-omniv-gold/10 text-omniv-gold"
                  : "text-omniv-text-secondary hover:bg-white/[0.03] hover:text-omniv-text"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active
                    ? "text-omniv-gold"
                    : "text-omniv-text-muted group-hover:text-omniv-text-secondary"
                )}
              />
              <span className="truncate">{item.label}</span>
              {active && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-omniv-gold/60" />
              )}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-0.5 border-t border-omniv-border px-3 py-3">
        {bottom.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm transition-all",
                active
                  ? "bg-omniv-gold/10 text-omniv-gold"
                  : "text-omniv-text-secondary hover:bg-white/[0.03] hover:text-omniv-text"
              )}
            >
              <Icon className="h-4 w-4 text-omniv-text-muted" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center gap-3 border-b border-omniv-border bg-omniv-elevated/95 px-4 backdrop-blur-md md:hidden">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-omniv-border text-omniv-text-secondary hover:bg-white/5 hover:text-omniv-text"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-omniv-gold/15">
            <span className="text-xs font-bold text-omniv-gold">O</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">Omniv</span>
        </div>
      </div>

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-dvh w-[240px] flex-col border-r border-omniv-border bg-omniv-elevated transition-transform duration-200 ease-out",
          "md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="hidden h-16 items-center gap-2.5 px-5 md:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-omniv-gold/15 glow-gold">
            <span className="text-sm font-bold tracking-tight text-omniv-gold">O</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-omniv-text">Omniv</p>
            <p className="text-[10px] uppercase tracking-widest text-omniv-text-muted">Strategy OS</p>
          </div>
        </div>
        <div className="h-14 md:hidden" />
        <NavLinks onNavigate={() => setOpen(false)} />
      </aside>
    </>
  );
}
