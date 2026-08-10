"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertProfile, getProfile } from "@/lib/db/profile";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  PAYOUT_COUNTRIES,
  ARTIST_SHARE_PCT,
  PLATFORM_SHARE_PCT,
  banksForCountry,
  countrySupportsAutoSplit,
} from "@/lib/flutterwave-banks";
import {
  Camera,
  Banknote,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function PayoutAndPhoto() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [tipName, setTipName] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [existingId, setExistingId] = useState("");
  const [subaccountId, setSubaccountId] = useState<string | null>(null);
  const [country, setCountry] = useState("NG");
  const [status, setStatus] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    void (async () => {
      if (!isSupabaseConfigured()) return;
      const p = await getProfile();
      if (!p) return;
      if (p.full_name) setName(p.full_name);
      if (p.avatar_url) setAvatarUrl(p.avatar_url);
      if (p.tip_display_name) setTipName(p.tip_display_name);
      if (p.payout_bank_name) setBankName(p.payout_bank_name);
      if (p.payout_account_name) setAccountName(p.payout_account_name);
      if (p.payout_account_number) setAccountNumber(p.payout_account_number);
      if (p.payout_method) setPayoutMethod(p.payout_method);
      if (p.payout_notes) setPayoutNotes(p.payout_notes);
      if (p.payout_subaccount_id) {
        setSubaccountId(p.payout_subaccount_id);
        setReady(true);
      }
      try {
        const res = await fetch("/api/payouts/subaccount");
        if (res.ok) {
          const data = (await res.json()) as {
            ready?: boolean;
            subaccountId?: string | null;
          };
          if (data.ready && data.subaccountId) {
            setReady(true);
            setSubaccountId(data.subaccountId);
          }
        }
      } catch {
        /* soft */
      }
    })();
  }, []);

  async function uploadAvatar(file: File) {
    setBusy(true);
    setStatus(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setStatus("Sign in required");
        return;
      }
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        if (dataUrl.length > 900_000) {
          setStatus("Image too large (under 600KB) or create Storage bucket avatars");
          return;
        }
        const res = await upsertProfile({ avatar_url: dataUrl });
        if (res.ok) {
          setAvatarUrl(dataUrl);
          setStatus("Photo saved");
        } else setStatus(res.error || "Save failed");
        return;
      }
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = pub.publicUrl + "?t=" + Date.now();
      const res = await upsertProfile({ avatar_url: url });
      if (res.ok) {
        setAvatarUrl(url);
        setStatus("Photo saved");
      } else setStatus(res.error || "Save failed");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveDetailsOnly() {
    setBusy(true);
    setStatus(null);
    const res = await upsertProfile({
      tip_display_name: tipName.trim() || null,
      payout_bank_name: bankName.trim() || null,
      payout_account_name: accountName.trim() || null,
      payout_account_number: accountNumber.trim() || null,
      payout_method: payoutMethod.trim() || null,
      payout_notes: payoutNotes.trim() || null,
    });
    setStatus(
      res.ok
        ? countrySupportsAutoSplit(country)
          ? "Details saved. Turn on auto-pay when you are ready."
          : "Details saved. We will pay out to this account on schedule."
        : res.error || "Save failed"
    );
    setBusy(false);
  }

  async function enableAutoPay() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/payouts/subaccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_bank: bankCode || undefined,
          account_number: accountNumber.trim(),
          business_name: accountName.trim() || tipName.trim(),
          bank_name: bankName.trim(),
          account_name: accountName.trim(),
          payout_method: payoutMethod.trim(),
          payout_notes: payoutNotes.trim(),
          country,
          existing_id: existingId.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
        subaccountId?: string;
        canSaveDetailsOnly?: boolean;
      };
      if (!res.ok) {
        if (data.canSaveDetailsOnly) {
          await saveDetailsOnly();
          setStatus(
            "Details saved for payout. Auto-pay needs payments fully on the server."
          );
        } else {
          setStatus(data.error || "Could not open payout lane");
        }
        return;
      }
      setReady(true);
      setSubaccountId(data.subaccountId || null);
      setStatus(
        data.message ||
          `You are set. About ${ARTIST_SHARE_PCT}% of each ticket and tip goes to your account.`
      );
    } catch {
      setStatus("Network error — try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-6 space-y-4">
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-omniv-border bg-omniv-gold/10 text-sm font-semibold text-omniv-gold">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              (name || "O").slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Profile / brand photo</p>
            <p className="text-xs text-omniv-text-muted">
              Shows in the nav and on your public rooms
            </p>
            <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-omniv-border px-3 py-1.5 text-xs hover:bg-white/5">
              <Camera className="h-3.5 w-3.5" />
              {busy ? "Working…" : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadAvatar(f);
                }}
              />
            </label>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-1 flex items-center gap-2">
          <Banknote className="h-4 w-4 text-omniv-gold" />
          <h3 className="text-sm font-medium">Get paid</h3>
        </div>
        <p className="mb-3 text-[12px] leading-snug text-omniv-text-muted">
          Fans pay on your room or tip link. Omniv collects. Your share goes to
          your bank or wallet — you do not open a Flutterwave account or paste
          codes.
        </p>

        <div className="mb-4 rounded-2xl border border-omniv-gold/25 bg-omniv-gold/5 px-3.5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-omniv-gold">
            Your cut
          </p>
          <p className="mt-1 text-[22px] font-semibold tracking-tight">
            {ARTIST_SHARE_PCT}%
            <span className="ml-1 text-[13px] font-normal text-omniv-text-muted">
              to you
            </span>
          </p>
          <p className="mt-0.5 text-[11px] text-omniv-text-muted">
            Omniv keeps {PLATFORM_SHARE_PCT}% for payments, rooms, and the product
          </p>
        </div>

        {ready && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <div>
              <p className="text-[13px] font-medium text-emerald-300">
                You're set to get paid
              </p>
              <p className="mt-0.5 text-[11px] text-omniv-text-muted">
                About {ARTIST_SHARE_PCT}% of new tickets and tips go to the account
                you saved. No codes to remember.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Name on tip link"
            value={tipName}
            onChange={(e) => setTipName(e.target.value)}
          />
          <div>
            <label className="mb-1 block text-[11px] text-omniv-text-muted">
              Country
            </label>
            <select
              className="h-10 w-full rounded-lg border border-omniv-border bg-omniv-black/40 px-3 text-sm"
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setBankCode("");
                setBankName("");
              }}
            >
              {PAYOUT_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.region} · {c.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[10px] text-omniv-text-muted">
              {countrySupportsAutoSplit(country)
                ? "Instant split is available here."
                : "We pay out to this bank on a schedule. Global artists are welcome."}
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-[11px] text-omniv-text-muted">
              Bank / wallet
            </label>
            <select
              className="h-10 w-full rounded-lg border border-omniv-border bg-omniv-black/40 px-3 text-sm"
              value={bankCode}
              onChange={(e) => {
                const code = e.target.value;
                setBankCode(code);
                const b = banksForCountry(country).find((x) => x.code === code);
                if (b) setBankName(b.name);
              }}
            >
              <option value="">Select…</option>
              {banksForCountry(country).map((b) => (
                <option key={`${b.country}-${b.code}-${b.name}`} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Confirm bank / wallet name"
            placeholder="As on your statement"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="sm:col-span-2"
          />
          <Input
            label="Account name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
          <Input
            label="Account number / IBAN / wallet ID"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
          <Input
            label="Notes (optional)"
            placeholder="Branch, routing, WhatsApp…"
            value={payoutNotes}
            onChange={(e) => setPayoutNotes(e.target.value)}
            className="sm:col-span-2"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {countrySupportsAutoSplit(country) ? (
            <>
              <Button
                size="sm"
                className="h-10 gap-1.5 rounded-xl"
                disabled={busy}
                onClick={() => void enableAutoPay()}
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {ready ? "Update payout account" : "Turn on auto-pay"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-10 rounded-xl"
                disabled={busy}
                onClick={() => void saveDetailsOnly()}
              >
                Save without auto-pay
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="h-10 gap-1.5 rounded-xl"
              disabled={busy}
              onClick={() => void saveDetailsOnly()}
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Save payout account
            </Button>
          )}
        </div>

        <button
          type="button"
          className="mt-3 flex w-full items-center justify-between rounded-xl border border-omniv-border/70 px-3 py-2 text-left text-[11px] text-omniv-text-muted"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          <span>Advanced (team only)</span>
          {showAdvanced ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
        {showAdvanced && (
          <div className="mt-2 space-y-2 rounded-xl border border-omniv-border bg-omniv-elevated/40 px-3 py-2.5">
            <Input
              label="Link existing subaccount ID"
              placeholder="Only if support gave you one"
              value={existingId}
              onChange={(e) => setExistingId(e.target.value)}
            />
            <p className="text-[10px] text-omniv-text-muted">
              Artists should not need this. Omniv opens the payout lane from bank
              details under the platform Flutterwave account.
            </p>
          </div>
        )}

        {status && (
          <p className="mt-2 text-[12px] leading-snug text-omniv-gold">{status}</p>
        )}
      </Card>
    </div>
  );
}
