"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertProfile, getProfile } from "@/lib/db/profile";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Camera, Banknote } from "lucide-react";

export function PayoutAndPhoto() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [tipName, setTipName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [status, setStatus] = useState<string | null>(null);

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
          setStatus(
            "Image too large (under 600KB) or create Storage bucket avatars"
          );
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

  async function savePayout() {
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
    setStatus(res.ok ? "Payout details saved" : res.error || "Save failed");
    setBusy(false);
  }

  return (
    <div className="mb-6 space-y-4">
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-omniv-border bg-omniv-gold/10 text-sm font-semibold text-omniv-gold">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt=""
                className="h-full w-full object-cover"
              />
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
          <h3 className="text-sm font-medium">Payout destination</h3>
        </div>
        <p className="mb-3 text-xs text-omniv-text-muted">
          Fans pay Omniv. You get paid out here. No Flutterwave account needed.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Tip display name"
            value={tipName}
            onChange={(e) => setTipName(e.target.value)}
          />
          <Input
            label="Method"
            placeholder="Bank / MoMo"
            value={payoutMethod}
            onChange={(e) => setPayoutMethod(e.target.value)}
          />
          <Input
            label="Bank / provider"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />
          <Input
            label="Account name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
          <Input
            label="Account number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="sm:col-span-2"
          />
          <Input
            label="Notes"
            placeholder="Branch, WhatsApp…"
            value={payoutNotes}
            onChange={(e) => setPayoutNotes(e.target.value)}
            className="sm:col-span-2"
          />
        </div>
        <Button
          size="sm"
          className="mt-4"
          disabled={busy}
          onClick={() => void savePayout()}
        >
          Save payout details
        </Button>
        {status && <p className="mt-2 text-xs text-omniv-gold">{status}</p>}
      </Card>
    </div>
  );
}
