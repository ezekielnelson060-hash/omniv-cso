"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Sparkles,
  MessageSquare,
  Disc3,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentPending } from "@/components/notifications/agent-nav-badge";

const tabs = [
  { href: "/crm", label: "Home", icon: Home },
  { href: "/opportunities", label: "Regional", icon: Sparkles },
  { href: "/ziki", label: "Ziki", icon: MessageSquare },
  { href: "/catalogue", label: "Music", icon: Disc3 },
  { href: "/analytics", label: "Progress", icon: BarChart3 },
] as const;

export function MobileTabBar() {
  const path = usePathname();
  useAgentPending(); // keep hook warm for sidebar badge

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-omniv-border bg-omniv-black/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-1">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            path === href ||
            (href !== "/crm" && path.startsWith(href)) ||
            (href === "/crm" && (path === "/" || path.startsWith("/crm")));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                active ? "text-omniv-gold" : "text-omniv-text-muted"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-omniv-gold")} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
