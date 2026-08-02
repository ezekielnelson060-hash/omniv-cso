"use client";

import { PlanProvider } from "@/components/billing/plan-provider";
import { RosterProvider } from "@/lib/roster-context";
import { CookieConsent } from "@/components/cookie-consent";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PlanProvider>
      <RosterProvider>
        {children}
        <CookieConsent />
      </RosterProvider>
    </PlanProvider>
  );
}
