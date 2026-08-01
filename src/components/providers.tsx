"use client";

import { PlanProvider } from "@/components/billing/plan-provider";
import { CookieConsent } from "@/components/cookie-consent";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PlanProvider>
      {children}
      <CookieConsent />
    </PlanProvider>
  );
}
