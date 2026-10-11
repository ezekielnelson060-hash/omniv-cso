"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

/**
 * Google Analytics 4 — Measurement ID is public by design.
 * Override with NEXT_PUBLIC_GA_MEASUREMENT_ID on Vercel if needed.
 */
const GA_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-LSVFXMK8GS";

const CONSENT_KEY = "omniv_cookie_consent_v1";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

function pagePath(pathname: string, searchParams: URLSearchParams | null) {
  const q = searchParams?.toString();
  return q ? `${pathname}?${q}` : pathname;
}

/** Fires page_view on App Router navigations (including first paint). */
function GaRouteListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!hasAnalyticsConsent()) return;
    if (typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }
    window.gtag("event", "page_view", {
      page_path: pagePath(pathname, searchParams),
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}

/**
 * Loads gtag only after the user accepts analytics cookies.
 * send_page_view is disabled on config so SPA navigations do not double-count.
 */
export function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(hasAnalyticsConsent());

    function onConsent(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      if (detail === "accepted") setEnabled(true);
      else if (detail === "essential") setEnabled(false);
    }

    window.addEventListener("omniv-consent", onConsent as EventListener);
    return () =>
      window.removeEventListener("omniv-consent", onConsent as EventListener);
  }, []);

  if (!GA_ID || !enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_ID}', {
  send_page_view: false,
  anonymize_ip: true
});
`}
      </Script>
      <Suspense fallback={null}>
        <GaRouteListener />
      </Suspense>
    </>
  );
}
