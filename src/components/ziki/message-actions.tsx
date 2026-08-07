"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

export function MessageActions({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Ziki · Omniv",
          text: content.slice(0, 800),
        });
      } else {
        await copy();
      }
    } catch {
      /* cancelled */
    }
  }

  return (
    <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
      <button
        type="button"
        className="inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-[10px] text-omniv-text-muted hover:bg-omniv-hover hover:text-omniv-text"
        onClick={() => void copy()}
      >
        {copied ? (
          <Check className="h-3 w-3 text-omniv-success" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
      <button
        type="button"
        className="inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-[10px] text-omniv-text-muted hover:bg-omniv-hover hover:text-omniv-text"
        onClick={() => void share()}
      >
        <Share2 className="h-3 w-3" />
        Share
      </button>
    </div>
  );
}
