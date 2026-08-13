"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, Share2 } from "lucide-react";

/**
 * Multi-channel share for Fan Gate / tip links.
 * Copy + system share sheet + WhatsApp + Telegram + X + SMS.
 */
export function ShareLinkButtons({
  url,
  message,
  previewHref,
  previewLabel = "Preview",
}: {
  url: string;
  message: string;
  previewHref?: string;
  previewLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* soft */
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Omniv", text: message, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    void copy();
  }

  function open(href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
  }

  const encodedMsg = encodeURIComponent(`${message} ${url}`);
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(message);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        className="h-9 gap-1.5 rounded-xl"
        onClick={() => void copy()}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {copied ? "Copied" : "Copy link"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-9 gap-1.5 rounded-xl"
        onClick={() => void nativeShare()}
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-9 rounded-xl"
        onClick={() => open(`https://wa.me/?text=${encodedMsg}`)}
      >
        WhatsApp
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-9 rounded-xl"
        onClick={() =>
          open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`)
        }
      >
        Telegram
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-9 rounded-xl"
        onClick={() =>
          open(`https://twitter.com/intent/tweet?text=${encodedMsg}`)
        }
      >
        X
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-9 rounded-xl"
        onClick={() => open(`sms:?&body=${encodedMsg}`)}
      >
        SMS
      </Button>
      {previewHref && (
        <Button size="sm" variant="outline" className="h-9 rounded-xl" asChild>
          <a href={previewHref} target="_blank" rel="noreferrer">
            {previewLabel}
          </a>
        </Button>
      )}
    </div>
  );
}
