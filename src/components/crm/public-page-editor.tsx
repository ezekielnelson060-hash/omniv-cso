"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

/**
 * Artist-only: edit display name + public taglines fans see.
 * Does not change the URL slug.
 */
export function PublicPageEditor({
  slug,
  onSaved,
}: {
  slug?: string | null;
  onSaved?: () => void;
}) {
  const [stageName, setStageName] = useState("");
  const [gateTagline, setGateTagline] = useState("");
  const [tipTagline, setTipTagline] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      try {
        const res = await fetch(
          `/api/roster/public?slug=${encodeURIComponent(slug)}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          stageName?: string;
          gateTagline?: string | null;
          tipTagline?: string | null;
        };
        if (data.stageName) setStageName(data.stageName);
        if (data.gateTagline) setGateTagline(data.gateTagline);
        if (data.tipTagline) setTipTagline(data.tipTagline);
      } catch {
        /* soft */
      }
    })();
  }, [slug]);

  if (!slug) return null;

  async function save() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch("/api/roster", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          stageName: stageName.trim() || undefined,
          gateTagline: gateTagline.trim() || null,
          tipTagline: tipTagline.trim() || null,
        }),
      });
      const data = (await res.json()) as { error?: string; code?: string };
      if (!res.ok) {
        setErr(data.error || "Could not save");
        return;
      }
      setMsg("Saved — fans see the new wording on your public links.");
      onSaved?.();
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-omniv-border p-4">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <p className="text-[13px] font-semibold">Public page wording</p>
        <p className="mt-0.5 text-[12px] text-omniv-text-secondary">
          What fans see on your list + tip links. {open ? "Hide" : "Edit"}
        </p>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <div>
            <label className="text-[11px] text-omniv-text-muted">
              Display name (not the URL)
            </label>
            <Input
              className="mt-1 h-10"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="Your stage name"
            />
          </div>
          <div>
            <label className="text-[11px] text-omniv-text-muted">
              Fan list subtext
            </label>
            <Input
              className="mt-1 h-10"
              value={gateTagline}
              onChange={(e) => setGateTagline(e.target.value)}
              placeholder="Hear about new music and shows near you first."
            />
          </div>
          <div>
            <label className="text-[11px] text-omniv-text-muted">
              Tip page subtext
            </label>
            <Input
              className="mt-1 h-10"
              value={tipTagline}
              onChange={(e) => setTipTagline(e.target.value)}
              placeholder="Support the music. Every tip helps the next song."
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="h-9 gap-1.5"
            disabled={busy}
            onClick={() => void save()}
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save public wording
          </Button>
          {msg && <p className="text-[12px] text-emerald-400">{msg}</p>}
          {err && <p className="text-[12px] text-omniv-danger">{err}</p>}
        </div>
      )}
    </Card>
  );
}
