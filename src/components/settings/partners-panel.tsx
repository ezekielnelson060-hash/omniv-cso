"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PARTNERS, partnerWebhookUrl, type PartnerDef } from "@/lib/partners";
import {
  Cable,
  Copy,
  Check,
  Loader2,
  Radio,
  ExternalLink,
} from "lucide-react";

export function PartnersPanel() {
  const [origin, setOrigin] = useState("https://www.omniv.media");
  const [copied, setCopied] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const webhook = partnerWebhookUrl(origin);

  function copy(text: string, key: string) {
    void navigator.clipboard.writeText(text);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1600);
  }

  async function testPartner(p: PartnerDef) {
    if (p.path !== "webhook") {
      setMsg(
        p.path === "oauth"
          ? "Connect Spotify in Settings (OAuth) — not a webhook test."
          : "Configure this partner in Settings / payout — not a webhook test."
      );
      return;
    }
    setBusyId(p.id);
    setMsg(null);
    try {
      const res = await fetch("/api/partners/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partnerId: p.id }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        actionType?: string;
        hint?: string;
      };
      if (!res.ok) {
        setMsg(data.error || data.hint || "Test failed");
        return;
      }
      setMsg(
        `Signal landed in Agent (${data.actionType || "action"}). Open inbox to confirm.`
      );
    } catch {
      setMsg("Network error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="mt-5 space-y-4 p-5">
      <div className="flex items-start gap-2">
        <Cable className="mt-0.5 h-4 w-4 text-omniv-gold" />
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Partners</h2>
          <p className="mt-0.5 text-[12px] text-omniv-text-muted">
            Distro, playlist, curator, sync, radio → Agent inbox. DSP and
            payments connect in Settings. One webhook for outside signals.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-omniv-gold/25 bg-omniv-gold/5 px-3 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-omniv-gold">
          Agent webhook
        </p>
        <p className="mt-1 break-all font-mono text-[11px] text-omniv-text-secondary">
          {webhook}
        </p>
        <p className="mt-1 text-[10px] text-omniv-text-muted">
          Auth:{" "}
          <code className="text-omniv-gold">
            Authorization: Bearer AGENT_WEBHOOK_SECRET
          </code>{" "}
          or header{" "}
          <code className="text-omniv-gold">x-omniv-webhook-secret</code>
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 text-[11px]"
            onClick={() => copy(webhook, "url")}
          >
            {copied === "url" ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            Copy URL
          </Button>
          <Link href="/notifications">
            <Button size="sm" variant="outline" className="h-8 text-[11px]">
              Open Agent inbox
            </Button>
          </Link>
        </div>
      </div>

      {msg && (
        <p className="text-[12px] text-omniv-text-secondary">
          {msg}{" "}
          {msg.includes("Agent") && (
            <Link href="/notifications" className="text-omniv-gold underline">
              Inbox
            </Link>
          )}
        </p>
      )}

      <ul className="space-y-2.5">
        {PARTNERS.map((p) => (
          <li
            key={p.id}
            className="rounded-xl border border-omniv-border bg-omniv-black/30 px-3.5 py-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5 text-omniv-gold" />
                  <p className="text-[13px] font-medium">{p.name}</p>
                  <span className="rounded-full border border-omniv-border px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-omniv-text-muted">
                    {p.path}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-omniv-text-muted">{p.blurb}</p>
                <p className="mt-1 text-[10px] text-omniv-text-muted">
                  {p.docsHint}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5 sm:items-end">
                {p.path === "webhook" && (
                  <Button
                    size="sm"
                    className="h-8 gap-1 text-[11px]"
                    disabled={busyId === p.id}
                    onClick={() => void testPartner(p)}
                  >
                    {busyId === p.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : null}
                    Test signal
                  </Button>
                )}
                {p.path === "oauth" && (
                  <Link href="/settings">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-[11px]"
                    >
                      Connect <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
                {p.path === "settings" && (
                  <Link href="/settings">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-[11px]"
                    >
                      Payout settings
                    </Button>
                  </Link>
                )}
                {p.path === "webhook" && (
                  <button
                    type="button"
                    className="text-[10px] text-omniv-gold hover:underline"
                    onClick={() =>
                      copy(
                        JSON.stringify(
                          {
                            userId: "<your-user-uuid>",
                            title: p.sampleTitle,
                            body: p.sampleBody,
                            urgency: "today",
                            impact: "high",
                          },
                          null,
                          2
                        ),
                        p.id
                      )
                    }
                  >
                    {copied === p.id ? "Copied payload" : "Copy sample JSON"}
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-[10px] text-omniv-text-muted">
        Partners post to the webhook with your user id. Omniv infers the action
        (outreach, catalogue, room, Ziki). Confirm chips in Agent execute the
        real move — that is the integration loop.
      </p>
    </Card>
  );
}
