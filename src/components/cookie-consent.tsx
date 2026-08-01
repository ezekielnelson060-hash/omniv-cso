"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const KEY = "omniv_cookie_consent_v1";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(KEY, "accepted");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  function essentialOnly() {
    try {
      localStorage.setItem(KEY, "essential");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-omniv-border bg-omniv-elevated/95 p-4 shadow-2xl backdrop-blur-md md:bottom-4 md:left-4 md:right-auto md:max-w-md md:rounded-2xl md:border"
    >
      <p className="text-sm font-medium text-omniv-text">Cookies</p>
      <p className="mt-1.5 text-xs leading-relaxed text-omniv-text-secondary">
        We use essential cookies to keep you signed in. Analytics cookies help us
        improve Omniv. See our{" "}
        <Link href="/cookies" className="text-omniv-gold hover:underline">
          Cookie Policy
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-omniv-gold hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={accept}>
          Accept all
        </Button>
        <Button size="sm" variant="outline" onClick={essentialOnly}>
          Essential only
        </Button>
      </div>
    </div>
  );
}
