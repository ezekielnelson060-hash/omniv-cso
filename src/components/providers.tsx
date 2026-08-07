"use client";

import { useEffect } from "react";
import { installGlobalErrorHandlers } from "@/lib/monitoring";
import { PlanProvider } from "@/components/billing/plan-provider";
import { RosterProvider } from "@/lib/roster-context";
import { CookieConsent } from "@/components/cookie-consent";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    installGlobalErrorHandlers();
  }, []);
  return (
    <ThemeProvider>
      <PlanProvider>
        <RosterProvider>
          {children}
          <CookieConsent />
        </RosterProvider>
      </PlanProvider>
    </ThemeProvider>
  );
}
