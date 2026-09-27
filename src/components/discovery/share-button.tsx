"use client";

import { useState } from "react";
import { recordSignal } from "@/lib/discovery/signals";

export function ShareButton({
  title,
  path,
}: {
  title: string;
  path: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${path}`
        : path;

    let shared = false;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url, text: title });
        shared = true;
      } catch {
        /* user cancelled or failed — fall through to copy */
      }
    }

    if (!shared) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        shared = true;
      } catch {
        /* ignore */
      }
    }

    if (shared) {
      recordSignal("share", [title.slice(0, 48)]);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onShare()}
      aria-label={copied ? "Copied" : "Share"}
      className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/5 hover:text-white"
    >
      {copied ? (
        <span className="text-[11px] font-medium text-omniv-gold">✓</span>
      ) : (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"
            strokeLinecap="round"
          />
          <path d="M12 16V4M8 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
