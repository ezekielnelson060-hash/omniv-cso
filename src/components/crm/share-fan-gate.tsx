"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, Pencil } from "lucide-react";
import { ShareLinkButtons } from "@/components/crm/share-link-buttons";
import { PublicPageEditor } from "@/components/crm/public-page-editor";

export function ShareFanGate({
  gateSlug,
  artistName,
  fanCount = 0,
}: {
  gateSlug?: string | null;
  artistName?: string | null;
  fanCount?: number;
}) {
  const [editing, setEditing] = useState(false);
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
    <div className="space-y-3">
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
                ? "One bio link: song, story, list, links, tips. Put it in Instagram / TikTok."
                : `${fanCount} on your list. Keep this link in bio.`}
            </p>
            {artistName && (
              <p className="mt-1 text-[11px] text-omniv-text-muted">
                Page for {artistName}
              </p>
            )}
            <p className="mt-2 break-all font-data text-[11px] text-omniv-gold">
              {url}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ShareLinkButtons
                url={url!}
                message={message}
                previewHref={url!}
                previewLabel="Preview page"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 gap-1.5 rounded-xl"
                onClick={() => setEditing((v) => !v)}
              >
                <Pencil className="h-3.5 w-3.5" />
                {editing ? "Close edit" : "Edit page"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {editing && (
        <PublicPageEditor
          slug={gateSlug}
          onSaved={() => {
            /* keep open so they can keep editing */
          }}
        />
      )}
    </div>
  );
}
