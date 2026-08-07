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

export function EarningsPanel() {
  const [total, setTotal] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [rows, setRows] = useState<Row[]>([]);
  const [hasSub, setHasSub] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/earnings");
        if (!res.ok) return;
        const data = (await res.json()) as {
          total: number;
          currency: string;
          rows: Row[];
          hasSubaccount: boolean;
        };
        setTotal(data.total || 0);
        setCurrency(data.currency || "USD");
        setRows(data.rows || []);
        setHasSub(Boolean(data.hasSubaccount));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Banknote className="h-4 w-4 text-omniv-gold" />
        <h2 className="text-sm font-semibold tracking-tight">Room earnings</h2>
      </div>
      <p className="mt-1 text-xs text-omniv-text-muted">
        Tickets and tips from your public room links.
      </p>
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
                No paid seats or tips yet. Share a room link.
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
