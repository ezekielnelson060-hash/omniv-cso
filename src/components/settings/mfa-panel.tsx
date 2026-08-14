"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Shield, Loader2, Check, Trash2 } from "lucide-react";

type Factor = {
  id: string;
  friendly_name?: string | null;
  factor_type: string;
  status: string;
};

export function MfaPanel() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }
    const all = [...(data?.totp || []), ...(data?.phone || [])] as Factor[];
    setFactors(all.filter((f) => f.status === "verified"));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function startEnroll() {
    setErr(null);
    setMsg(null);
    setEnrolling(true);
    setBusy(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Omniv Authenticator",
      });
      if (error) {
        setErr(error.message);
        setEnrolling(false);
        setBusy(false);
        return;
      }
      setFactorId(data.id);
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Enroll failed");
      setEnrolling(false);
    }
    setBusy(false);
  }

  async function verifyEnroll() {
    if (!factorId || code.trim().length < 6) return;
    setBusy(true);
    setErr(null);
    try {
      const supabase = createClient();
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) {
        setErr(challenge.error.message);
        setBusy(false);
        return;
      }
      const verified = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: code.trim(),
      });
      if (verified.error) {
        setErr(verified.error.message);
        setBusy(false);
        return;
      }
      setMsg("Two-factor authentication is on.");
      setEnrolling(false);
      setQr(null);
      setSecret(null);
      setCode("");
      setFactorId(null);
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Verify failed");
    }
    setBusy(false);
  }

  async function unenroll(id: string) {
    if (!confirm("Turn off 2FA for this device? You can re-enable anytime.")) return;
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) setErr(error.message);
    else {
      setMsg("2FA removed.");
      await refresh();
    }
    setBusy(false);
  }

  if (!isSupabaseConfigured()) {
    return (
      <Card className="p-5">
        <p className="text-xs text-omniv-text-muted">Connect Supabase to enable 2FA.</p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <Shield className="h-4 w-4 text-omniv-gold" />
        <h3 className="text-sm font-medium">Two-factor authentication</h3>
        {factors.length > 0 && <Badge variant="success">On</Badge>}
      </div>
      <p className="mb-3 text-xs text-omniv-text-secondary">
        Protect tips, tickets, and payout settings. Use Google Authenticator, Authy, or any TOTP app.
      </p>

      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-omniv-gold" />
      ) : (
        <>
          {factors.length > 0 && (
            <ul className="mb-3 space-y-2">
              {factors.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between rounded-lg border border-omniv-border px-3 py-2 text-xs"
                >
                  <span className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-omniv-gold" />
                    {f.friendly_name || "Authenticator"} · {f.factor_type}
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    className="text-omniv-text-muted hover:text-omniv-danger"
                    onClick={() => void unenroll(f.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!enrolling && (
            <Button size="sm" disabled={busy} onClick={() => void startEnroll()}>
              {factors.length ? "Add another authenticator" : "Enable 2FA"}
            </Button>
          )}

          {enrolling && qr && (
            <div className="mt-3 space-y-3 rounded-lg border border-omniv-gold/30 bg-omniv-gold/5 p-4">
              <p className="text-xs text-omniv-text-secondary">
                Scan this QR with your authenticator app, then enter the 6-digit code.
              </p>
              <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-lg bg-white p-2">
                {qr.startsWith("data:") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qr} alt="2FA QR code" className="h-40 w-40" />
                ) : qr.startsWith("<svg") ? (
                  <div
                    className="h-40 w-40"
                    dangerouslySetInnerHTML={{ __html: qr }}
                  />
                ) : (
                  <p className="break-all p-2 font-data text-[10px] text-black">
                    {secret}
                  </p>
                )}
              </div>
              {secret && (
                <p className="text-center font-data text-[11px] text-omniv-text-muted">
                  Or enter manually:{" "}
                  <span className="text-omniv-gold">{secret}</span>
                </p>
              )}
              <Input
                label="6-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={busy || code.length < 6}
                  onClick={() => void verifyEnroll()}
                >
                  {busy ? "Verifying…" : "Confirm & enable"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    setEnrolling(false);
                    setQr(null);
                    setSecret(null);
                    setCode("");
                    setFactorId(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {err && <p className="mt-2 text-xs text-omniv-danger">{err}</p>}
      {msg && <p className="mt-2 text-xs text-omniv-gold">{msg}</p>}
    </Card>
  );
}
