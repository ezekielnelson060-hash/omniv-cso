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
          Artist page not ready
        </p>
        <p className="mt-1 text-[12px] text-omniv-text-secondary">
          Add yourself on the roster (stage name) so Omniv can open your bio
          link. Then put it in Instagram / TikTok.
        </p>
      </Card>
    );
  }

  const empty = fanCount === 0;
  const name = artistName || "me";
  const message = `Join ${name} — music, list, and shows near you:`;

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
            {empty ? "Share your artist page" : "Your artist page"}
          </p>
          <p className="mt-1 text-[12px] text-omniv-text-secondary">
            {empty
              ? "One bio link: song, story, email + city list, links, and tips. Edit the page below, then put this URL in Instagram / TikTok."
              : `${fanCount} on your list. Keep this link in bio — song, list, tips in one place.`}
          </p>
          {artistName && (
            <p className="mt-1 text-[11px] text-omniv-text-muted">
              Page for {artistName}
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
              previewLabel="Preview page"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
