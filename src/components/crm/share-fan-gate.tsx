"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Link2 } from "lucide-react";
import { ShareLinkButtons } from "@/components/crm/share-link-buttons";

export function ShareFanGate({
  gateSlug,
  artistName,
  fanCount = 0,
}: {
  gateSlug?: string | null;
  artistName?: string | null;
  fanCount?: number;
}) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://omniv.media";

  const url = useMemo(() => {
    if (!gateSlug) return null;
    return `${origin}/f/${gateSlug}?source=bio`;
  }, [gateSlug, origin]);

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
  const name = artistName || "me";
  const message = `Join ${name}'s list — drop your city if you'd show up:`;

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
              ? "Fans enter email + city + would attend. That fills your map and rooms. Put this link in Instagram / TikTok bio, or share below."
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
          <div className="mt-3">
            <ShareLinkButtons
              url={url!}
              message={message}
              previewHref={url!}
              previewLabel="Preview gate"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
