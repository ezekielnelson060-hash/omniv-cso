"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PAYOUT_COUNTRIES,
  ARTIST_SHARE_PCT,
  banksForCountry,
  countrySupportsAutoSplit,
} from "@/lib/flutterwave-banks";
import { Banknote, Loader2 } from "lucide-react";

type Artist = {
  id: string;
  stage_name: string;
  slug: string;
};

type PayoutDraft = {
  country: string;
  bankName: string;
  bankCode: string;
  accountName: string;
  accountNumber: string;
  notes: string;
};

const empty: PayoutDraft = {
  country: "NG",
  bankName: "",
  bankCode: "",
  accountName: "",
  accountNumber: "",
  notes: "",
};

export function RosterPayouts() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState<PayoutDraft>(empty);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/roster");
        const data = (await res.json()) as { artists?: Artist[] };
        const list = data.artists || [];
        setArtists(list);
        const map: Record<string, boolean> = {};
        for (const a of list) {
          try {
            map[a.id] = Boolean(
              localStorage.getItem(`omniv_roster_payout_${a.id}`)
            );
          } catch {
            map[a.id] = false;
          }
        }
        setSaved(map);
        if (list[0]) setActive(list[0].id);
      } catch {
        /* soft */
      }
    })();
  }, []);

  useEffect(() => {
    if (!active) return;
    try {
      const raw = localStorage.getItem(`omniv_roster_payout_${active}`);
      if (raw) setDraft(JSON.parse(raw) as PayoutDraft);
      else setDraft(empty);
    } catch {
      setDraft(empty);
    }
  }, [active]);

  async function save() {
    if (!active) return;
    setBusy(true);
    setStatus(null);
    try {
      localStorage.setItem(
        `omniv_roster_payout_${active}`,
        JSON.stringify(draft)
      );
      setSaved((s) => ({ ...s, [active]: true }));
      try {
        await fetch("/api/roster/payout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rosterArtistId: active,
            ...draft,
          }),
        });
      } catch {
        /* soft */
      }
      setStatus(
        countrySupportsAutoSplit(draft.country)
          ? `Saved. ~${ARTIST_SHARE_PCT}% of this artist's tips can route here when auto-pay is on.`
          : "Saved. Global payout on schedule for this artist."
      );
    } finally {
      setBusy(false);
    }
  }

  if (artists.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-[13px] text-omniv-text-secondary">
          Add artists to your roster first — then set payout per act.
        </p>
      </Card>
    );
  }

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-start gap-2">
        <Banknote className="mt-0.5 h-4 w-4 text-omniv-gold" />
        <div>
          <h3 className="text-sm font-semibold">Payout per artist</h3>
          <p className="mt-0.5 text-[12px] text-omniv-text-muted">
            Labels: each act can have its own bank. You keep ~{ARTIST_SHARE_PCT}%
            per charge when auto-pay is on.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {artists.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setActive(a.id)}
            className={
              active === a.id
                ? "rounded-full bg-omniv-gold px-3 py-1 text-[11px] font-semibold text-omniv-black"
                : "rounded-full border border-omniv-border px-3 py-1 text-[11px] text-omniv-text-muted"
            }
          >
            {a.stage_name}
            {saved[a.id] ? " · ✓" : ""}
          </button>
        ))}
      </div>

      {active && (
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] text-omniv-text-muted">
              Country
            </label>
            <select
              className="h-10 w-full rounded-lg border border-omniv-border bg-omniv-black/40 px-3 text-sm"
              value={draft.country}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  country: e.target.value,
                  bankCode: "",
                  bankName: "",
                }))
              }
            >
              {PAYOUT_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.region} · {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] text-omniv-text-muted">
              Bank / wallet
            </label>
            <select
              className="h-10 w-full rounded-lg border border-omniv-border bg-omniv-black/40 px-3 text-sm"
              value={draft.bankCode}
              onChange={(e) => {
                const code = e.target.value;
                const b = banksForCountry(draft.country).find(
                  (x) => x.code === code
                );
                setDraft((d) => ({
                  ...d,
                  bankCode: code,
                  bankName: b?.name || d.bankName,
                }));
              }}
            >
              <option value="">Select…</option>
              {banksForCountry(draft.country).map((b) => (
                <option key={`${b.code}-${b.name}`} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Account name"
            value={draft.accountName}
            onChange={(e) =>
              setDraft((d) => ({ ...d, accountName: e.target.value }))
            }
          />
          <Input
            label="Account number"
            value={draft.accountNumber}
            onChange={(e) =>
              setDraft((d) => ({ ...d, accountNumber: e.target.value }))
            }
          />
          <Input
            label="Notes"
            value={draft.notes}
            onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
            className="sm:col-span-2"
          />
          <Button
            size="sm"
            className="h-9 rounded-xl sm:col-span-2"
            disabled={busy}
            onClick={() => void save()}
          >
            {busy ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : null}
            Save payout for this artist
          </Button>
        </div>
      )}

      {status && <p className="text-[12px] text-omniv-gold">{status}</p>}
    </Card>
  );
}
