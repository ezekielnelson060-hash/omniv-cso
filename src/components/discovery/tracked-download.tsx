"use client";

import { recordSignal } from "@/lib/discovery/signals";

/** Download link that records a download signal for analytics. */
export function TrackedDownload({
  href,
  publicationSlug,
  publicationType,
  className,
  children,
}: {
  href: string;
  publicationSlug: string;
  publicationType?: string;
  className?: string;
  children: React.ReactNode;
}) {
  function onClick() {
    recordSignal(
      "download",
      [publicationType || "media"].filter(Boolean),
      publicationType,
      {
        publicationSlug,
        source: "download",
      }
    );
    // Best-effort server analytics counter
    try {
      void fetch("/api/discovery/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "download",
          publicationSlug,
          publicationType,
        }),
        keepalive: true,
      });
    } catch {
      /* offline */
    }
  }

  return (
    <a
      href={href}
      download
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={className}
    >
      {children}
    </a>
  );
}
