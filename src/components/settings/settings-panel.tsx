"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { integrations, mockTeam, paymentProvider, plans } from "@/data/phase6";
import { usePlan } from "@/components/billing/plan-provider";
import { CreditCard, Users, Key, Bell, Plug } from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsPanel() {
  const { plan, setPlan } = usePlan();

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h3 className="text-sm font-medium">Profile</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input label="Display name" defaultValue="You" />
          <Input label="Email" type="email" defaultValue="you@omniv.app" />
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Billing</h3>
          <Badge variant="gold">{paymentProvider.name} connected</Badge>
        </div>
        <p className="mb-4 text-xs text-omniv-text-secondary">{paymentProvider.note}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {plans.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() =>
                setPlan(
                  p.id === "starter" ? "starter" : p.id === "pro" ? "pro" : "label"
                )
              }
              className={cn(
                "rounded-[var(--radius-lg)] border p-4 text-left transition-all",
                p.highlighted || plan === p.id
                  ? "border-omniv-gold/40 bg-omniv-gold/10"
                  : "border-omniv-border"
              )}
            >
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="text-lg font-semibold text-omniv-gold">
                ${p.priceMonthly}
                <span className="text-xs font-normal text-omniv-text-muted">/mo</span>
              </p>
              <p className="mt-1 text-[11px] text-omniv-text-muted">{p.blurb}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Team</h3>
        </div>
        <ul className="space-y-2">
          {mockTeam.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-[var(--radius)] border border-omniv-border px-3 py-2 text-sm"
            >
              <span>
                {m.name}{" "}
                <span className="text-omniv-text-muted">· {m.email}</span>
              </span>
              <Badge variant="outline">{m.role}</Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Plug className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Integrations</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {integrations.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between rounded-[var(--radius)] border border-omniv-border px-3 py-2"
            >
              <div>
                <p className="text-sm text-omniv-text">{i.name}</p>
                <p className="text-[11px] text-omniv-text-muted">{i.description}</p>
              </div>
              <Badge variant={i.connected ? "success" : "outline">
                {i.connected ? "On" : "Off"}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Bell className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Notifications</h3>
        </div>
        <p className="text-xs text-omniv-text-secondary">
          Opportunity alerts, billing, and team invites are enabled by default.
        </p>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Key className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">API keys</h3>
        </div>
        <p className="mb-3 text-xs text-omniv-text-secondary">
          Available on Label plan. Keys are never shown in full after creation.
        </p>
        <Button variant="outline" size="sm">
          Generate key
        </Button>
      </Card>
    </div>
  );
}
