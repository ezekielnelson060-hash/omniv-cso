"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Copy, Link2, Share2 } from "lucide-react";

/**
 * High-leverage: one place to copy / share the Fan Gate.
 * Without this link live, city heat and rooms stay empty.
 */
export function ShareFanGate({
  gateSlug,
  artistName,
  fanCount = 0,
}: {
  gateSlug?: string | null;
  artistName?: string | null;
  fanCount?: number;
}) {
  const [copied, setCopied] = useState(false);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://omniv.media";

  const url = useMemo(() => {
    if (!gateSlug) return null;
    return `${origin}/f/${gateSlug}?source=bio`;
  }, [gateSlug, origin]);

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* soft */
    }
  }

  function shareWhatsApp() {
    if (!url) return;
    const text = encodeURIComponent(
      `Join my list — drop your city if you’d show up: ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  }

  if (!gateSlug) {
    return (
      <Card className="border-omniv-gold/25 bg-omniv-gold/5 p-4">
        <p className="text-[13px] font-semibold text-omniv-gold">
          Fan Gate not ready
        </p>
        <p className="mt-1 text-[12px] text-omniv-text-secondary">
          Add yourself on the roster (stage name) so Omniv can open your gate
          link. Then put it in your bio.
        </p>
      </Card>
    );
  }

  const empty = fanCount === 0;

  return (
    <Card
      className={
        empty
          ? "border-omniv-gold/30 bg-omniv-gold/5 p-4"
          : "border-omniv-border p-4"
      }
    >
      <div className="flex items-start gap-2">
        <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-omniv-gold" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold">
            {empty ? "Share your Fan Gate" : "Your Fan Gate"}
          </p>
          <p className="mt-1 text-[12px] text-omniv-text-secondary">
            {empty
              ? "Fans enter email + city + “would attend.” That fills your map and rooms. Put this link in Instagram / TikTok bio."
              : `${fanCount} on your list. Keep the link in bio so the list keeps growing.`}
          </p>
          {artistName && (
            <p className="mt-1 text-[11px] text-omniv-text-muted">
              Gate for {artistName}
            </p>
          )}
          <p className="mt-2 break-all font-data text-[11px] text-omniv-gold">
            {url}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
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
              onClick={shareWhatsApp}
            >
              <Share2 className="h-3.5 w-3.5" />
              WhatsApp
            </Button>
            <Button size="sm" variant="outline" className="h-9 rounded-xl" asChild>
              <a href={url!} target="_blank" rel="noreferrer">
                Preview gate
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
