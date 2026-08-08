"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { CrmPanel } from "@/components/crm/crm-panel";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function CrmPage() {
  return (
    <AppShell>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-data text-[10px] uppercase tracking-[0.14em] text-omniv-gold">
            Home
          </p>
          <h1 className="text-lg font-semibold tracking-tight md:text-xl">
            Command Center
          </h1>
          <p className="text-[11px] text-omniv-text-muted">
            Fans, rooms, city heat, gatherings — what you own, not what the
            algorithm rents.
          </p>
        </div>
        <Link href="/label">
          <Button variant="outline" size="sm" className="h-7 gap-1 text-[11px]">
            <Building2 className="h-3 w-3" />
            Label
          </Button>
        </Link>
      </div>
      <CrmPanel />
    </AppShell>
  );
}
