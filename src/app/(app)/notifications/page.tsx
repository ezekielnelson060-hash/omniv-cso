"use client";

import { AppShell } from "@/components/layout/app-shell";
import { NotificationsPanel } from "@/components/notifications/notifications-panel";

export default function NotificationsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-omniv-text-secondary">
          Opportunities, system, billing, and team alerts
        </p>
      </div>
      <NotificationsPanel />
    </AppShell>
  );
}
