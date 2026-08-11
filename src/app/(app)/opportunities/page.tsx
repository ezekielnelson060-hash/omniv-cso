"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { NotificationsPanel } from "@/components/notifications/notifications-panel";

/** Legacy strategy feed → execution Moves inbox. */
export default function OpportunitiesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/notifications");
  }, [router]);

  return (
    <AppShell>
      <div className="mb-4">
        <p className="font-data text-[10px] uppercase tracking-[0.16em] text-omniv-gold">
          Moves
        </p>
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
          Do this next
        </h1>
        <p className="mt-1 text-[12px] text-omniv-text-secondary">
          One card. One button. Confirm and execute.
        </p>
      </div>
      <NotificationsPanel />
    </AppShell>
  );
}
