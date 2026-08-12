"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Banknote, AlertCircle } from "lucide-react";

type Row = {
  amount: number;
  currency: string;
  email: string | null;
  at: string;
  title: string;
  isTip: boolean;
};

function TipLinkBlock() {
  const [artists, setArtists] = useState<{ slug: string; name: string }[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/roster");
        if (!res.ok) return;
        const data = (await res.json()) as {
          artists?: { slug?: string; stage_name?: string; name?: string }[];
        };
        setArtists(
          (data.artists || [])
            .filter((a) => a.slug)
            .map((a) => ({
              slug: String(a.slug),
              name: String(a.stage_name || a.name || a.slug),
            }))
        );
      } catch {
        /* soft */
      }
    })();
  }, []);

  async function createMyTipLink() {
    setCreating(true);
    setCreateErr(null);
    try {
      const res = await fetch("/api/roster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageName: "My tip jar" }),
      });
      const data = (await res.json()) as {
        artist?: { slug?: string; stage_name?: string };
        error?: string;
      };
      if (!res.ok) {
        setCreateErr(data.error || "Could not create tip link");
        return;
      }
      if (data.artist?.slug) {
        const next = {
          slug: String(data.artist.slug),
          name: String(data.artist.stage_name || data.artist.slug),
        };
        setArtists((prev) => {
          if (prev.some((a) => a.slug === next.slug)) return prev;
          return [next, ...prev];
        });
      } else {
        setCreateErr("Created but no slug returned");
      }
    } catch {
      setCreateErr("Network error");
    } finally {
      setCreating(false);
    }
  }

  if (!artists.length) {
    return (
      <div className="mt-3 space-y-2 rounded-xl border border-omniv-gold/25 bg-omniv-gold/5 px-3 py-2">
        <p className="text-[11px] text-omniv-text-muted">
          No tip link yet. Create one to put in your bio — fans tip without a
          room.
        </p>
        <button
          type="button"
          disabled={creating}
          onClick={() => void createMyTipLink()}
          className="rounded-lg bg-omniv-gold px-3 py-1.5 text-[12px] font-semibold text-omniv-black disabled:opacity-50"
        >
          {creating ? "Creating…" : "Create tip link"}
        </button>
        {createErr ? (
          <p className="text-[11px] text-red-400">{createErr}</p>
        ) : null}
      </div>
    );
  }

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://omniv.media";

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-omniv-gold/25 bg-omniv-gold/5 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-omniv-gold">
        Tip links (per account)
      </p>
      {artists.map((a) => {
        const url = `${origin}/tip/${a.slug}`;
        return (
          <div
            key={a.slug}
            className="border-t border-omniv-border/40 pt-2 first:border-0 first:pt-0"
          >
            <p className="text-[11px] font-medium">{a.name}</p>
            <p className="break-all text-[10px] text-omniv-text-muted">{url}</p>
            <div className="mt-1 flex flex-wrap gap-3">
              <button
                type="button"
                className="text-[11px] font-medium text-omniv-gold hover:underline"
                onClick={() => {
                  void navigator.clipboard.writeText(url);
                  setCopied(a.slug);
                  window.setTimeout(() => setCopied(null), 1500);
                }}
              >
                {copied === a.slug ? "Copied" : "Copy tip link"}
              </button>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-medium text-omniv-text-secondary hover:underline"
              >
                Open tip page
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function EarningsPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [hasSub, setHasSub] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/earnings");
        if (!res.ok) return;
        const data = (await res.json()) as {
          rows?: Row[];
          total?: number;
          currency?: string;
          hasSubaccount?: boolean;
        };
        setRows(data.rows || []);
        setTotal(Number(data.total || 0));
        setCurrency(data.currency || "USD");
        setHasSub(Boolean(data.hasSubaccount));
      } catch {
        /* soft */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Banknote className="h-4 w-4 text-omniv-gold" />
        <h2 className="text-sm font-semibold tracking-tight">Earnings</h2>
      </div>
      <p className="mt-1 text-xs text-omniv-text-muted">
        Tickets from rooms + tips from standalone tip links.
      </p>
      <TipLinkBlock />
      {loading ? (
        <p className="mt-4 text-xs text-omniv-text-muted">Loading…</p>
      ) : (
        <>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-omniv-gold">
            {currency} {total.toFixed(2)}
          </p>
          {!hasSub && (
            <div className="mt-3 flex gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[11px] text-omniv-text-secondary">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span>
                No Flutterwave subaccount linked. Funds settle to the platform
                merchant until you add your{" "}
                <Link href="/settings" className="text-omniv-gold underline">
                  payout ID in Settings
                </Link>
                . Then new ticket and tip charges split to you automatically.
              </span>
            </div>
          )}
          {hasSub && (
            <p className="mt-2 text-[11px] text-omniv-text-muted">
              Subaccount connected. New charges split to your Flutterwave
              payout destination.
            </p>
          )}
          <ul className="mt-4 max-h-40 space-y-1.5 overflow-y-auto text-xs">
            {rows.length === 0 && (
              <li className="text-omniv-text-muted">
                No paid seats or tips yet. Share a room or tip link.
              </li>
            )}
            {rows.slice(0, 12).map((r, i) => (
              <li
                key={`${r.at}-${i}`}
                className="flex justify-between gap-2 border-b border-omniv-border/60 py-1.5 last:border-0"
              >
                <span className="truncate text-omniv-text-secondary">
                  {r.isTip ? "Tip" : "Ticket"} · {r.title}
                </span>
                <span className="shrink-0 font-medium">
                  {r.currency} {Number(r.amount).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
