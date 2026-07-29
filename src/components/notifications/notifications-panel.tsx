"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mockNotifications, type AppNotification } from "@/data/phase6";
import { cn } from "@/lib/utils";
import {
  Bell,
  CheckCheck,
  Sparkles,
  CreditCard,
  Users,
  Info,
} from "lucide-react";

const typeIcon = {
  opportunity: Sparkles,
  system: Info,
  billing: CreditCard,
  team: Users,
};

export function NotificationsPanel() {
  const [items, setItems] = useState(mockNotifications);

  const unread = items.filter((n) => !n.read).length;

  function markAll() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="gold">{unread} unread</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={markAll} className="gap-1.5">
          <CheckCheck className="h-3.5 w-3.5" />
          Mark all read
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((n) => (
          <NotificationRow key={n.id} n={n} onToggle={() => toggle(n.id)} />
        ))}
      </div>

      {items.length === 0 && (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <Bell className="h-8 w-8 text-omniv-text-muted" />
          <p className="text-sm text-omniv-text-secondary">
            You&apos;re caught up. High-impact moves will land here.
          </p>
        </Card>
      )}
    </div>
  );
}

function NotificationRow({
  n,
  onToggle,
}: {
  n: AppNotification;
  onToggle: () => void;
}) {
  const Icon = typeIcon[n.type];
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full gap-3 rounded-[var(--radius-lg)] border px-4 py-3 text-left transition-all",
        n.read
          ? "border-omniv-border bg-omniv-card/50"
          : "border-omniv-gold/20 bg-omniv-gold/5"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          n.read ? "bg-white/5" : "bg-omniv-gold/15"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            n.read ? "text-omniv-text-muted" : "text-omniv-gold"
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm font-medium",
              n.read ? "text-omniv-text-secondary" : "text-omniv-text"
            )}
          >
            {n.title}
          </p>
          <span className="shrink-0 text-[11px] text-omniv-text-muted">
            {n.time}
          </span>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-omniv-text-muted">
          {n.body}
        </p>
      </div>
      {!n.read && (
        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-omniv-gold" />
      )}
    </button>
  );
}
