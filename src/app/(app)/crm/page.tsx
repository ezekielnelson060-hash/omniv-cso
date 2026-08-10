"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { CrmPanel } from "@/components/crm/crm-panel";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

function CrmInner() {
  const sp = useSearchParams();
  const city = sp.get("city");
  const readyRaw = sp.get("ready");
  const ready = readyRaw ? Number(readyRaw) : null;
  const focus = sp.get("focus");

  return (
    <>
      <div className="relative -mx-3 mb-4 overflow-hidden sm:-mx-4 md:mx-0 md:rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/12 via-omniv-gold/8 to-transparent" />
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-3 px-3 pb-4 pt-1 sm:flex-row sm:items-end sm:justify-between sm:px-4 md:px-5 md:pt-4">
          <div>
            <p className="font-data text-[10px] uppercase tracking-[0.16em] text-omniv-gold">
              Home
            </p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
              Command Center
            </h1>
            <p className="mt-1 max-w-lg text-[12px] text-omniv-text-secondary">
              {city
                ? `Scan pointed here: draft a room in ${city}${
                    ready ? ` · ${ready} fans marked ready` : ""
                  }.`
                : "Fans, rooms, city heat, gatherings — what you own, not what the algorithm rents."}
            </p>
          </div>
          <Link href="/label">
            <Button
              variant="outline"
              className="h-10 gap-1.5 rounded-xl px-4 text-[12px]"
            >
              <Building2 className="h-4 w-4" />
              Label
            </Button>
          </Link>
        </div>
      </div>
      <CrmPanel
        initialCity={city}
        initialReady={ready && !Number.isNaN(ready) ? ready : null}
        focusRoom={focus === "room"}
      />
    </>
  );
}

export default function CrmPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <p className="text-sm text-omniv-text-muted">Loading Command Center…</p>
        }
      >
        <CrmInner />
      </Suspense>
    </AppShell>
  );
}
