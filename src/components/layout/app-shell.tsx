"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { AgentLiveSignals } from "@/components/notifications/agent-toast";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/** Soft page views so Ziki operating brief sees where the artist spends time. */
function PathTracker() {
  const path = usePathname();
  useEffect(() => {
    if (!path) return;
    track("page_view", { section: path.split("/")[1] || "root" }, path);
  }, [path]);
  return null;
}

export function AppShell({
  children,
  fullBleed,
}: {
  children: ReactNode;
  /** Edge-to-edge main (Ziki full chat) */
  fullBleed?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-omniv-black text-omniv-text">
      <PathTracker />
      <Sidebar />
      <main
        className={cn(
          "md:pl-[240px]",
          fullBleed
            ? "pt-12 md:pt-0"
            : "px-3 pb-[calc(3.5rem+env(safe-area-inset-bottom)+0.75rem)] pt-14 sm:px-4 md:px-6 md:pb-12 md:pt-5"
        )}
      >
        {fullBleed ? (
          <div className="h-[calc(100dvh-3rem)] md:h-dvh">{children}</div>
        ) : (
          <div className="mx-auto max-w-6xl">{children}</div>
        )}
      </main>
      {!fullBleed && <MobileTabBar />}
      <AgentLiveSignals />
    </div>
  );
}
