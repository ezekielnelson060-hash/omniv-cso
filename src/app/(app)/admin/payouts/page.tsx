"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Banknote, Loader2, Check } from "lucide-react";

type Row = {
  user_id: string;
  tip_name: string | null;
  bank: string | null;
  account_name: string | null;
  account_number: string | null;
  method: string | null;
  notes: string | null;
  email: string | null;
  full_name: string | null;
  total_cents: number;
  payments: number;
};

export default function AdminPayoutsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch("/api/admin/payouts");
        const json = await res.json();
        if (!res.ok) {
          setErr(json.error || "Not authorized");
          return;
        }
        setRows(json.rows || []);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
        <div>
          <p className="font-data text-[11px] uppercase tracking-[0.16em] text-omniv-gold">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Payout queue
          </h1>
          <p className="mt-1 text-sm text-omniv-text-muted">
            Artists owed from room tickets and tips. Pay out to bank details,
            then mark paid.
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-omniv-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}
        {err && (
          <Card className="border-amber-500/30 p-4 text-sm text-omniv-text-secondary">
            {err}
          </Card>
        )}

        <ul className="space-y-3">
          {rows.map((r) => {
            const dollars = (r.total_cents / 100).toFixed(2);
            const isPaid = paid[r.user_id];
            return (
              <li key={r.user_id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {r.full_name ||
                          r.tip_name ||
                          r.email ||
                          r.user_id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-omniv-text-muted">{r.email}</p>
                      <p className="mt-2 text-sm text-omniv-gold">
                        ${dollars} · {r.payments} payments
                      </p>
                      <p className="mt-2 text-xs text-omniv-text-secondary">
                        {[r.method, r.bank, r.account_name, r.account_number]
                          .filter(Boolean)
                          .join(" · ") || "No bank details saved"}
                      </p>
                      {r.notes && (
                        <p className="mt-1 text-[11px] text-omniv-text-muted">
                          {r.notes}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={isPaid ? "outline" : "default"}
                      className="gap-1"
                      onClick={() =>
                        setPaid((p) => ({ ...p, [r.user_id]: true }))
                      }
                      disabled={isPaid}
                    >
                      {isPaid ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Marked
                        </>
                      ) : (
                        <>
                          <Banknote className="h-3.5 w-3.5" /> Mark paid
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
        {!loading && !err && rows.length === 0 && (
          <p className="text-sm text-omniv-text-muted">No owed balances yet.</p>
        )}
      </div>
    </AppShell>
  );
}
