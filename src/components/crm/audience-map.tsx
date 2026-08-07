"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { MapPin, Mail, Copy, Loader2 } from "lucide-react";

type CityRow = { city: string; total: number; ready: number };

export function AudienceMap({
  onCreateGathering,
}: {
  onCreateGathering?: (city: string, ready: number) => void;
}) {
  const [rows, setRows] = useState<CityRow[]>([]);
  const [busyCity, setBusyCity] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      if (!isSupabaseConfigured()) return;
      const supabase = createClient();
      const { data } = await supabase
        .from("fans")
        .select("city, would_attend")
        .limit(2000);
      const map = new Map<string, { total: number; ready: number }>();
      for (const f of data || []) {
        const city = (f.city as string)?.trim() || "Unknown";
        const cur = map.get(city) || { total: 0, ready: 0 };
        cur.total += 1;
        if (f.would_attend) cur.ready += 1;
        map.set(city, cur);
      }
      setRows(
        [...map.entries()]
          .map(([city, v]) => ({ city, ...v }))
          .sort((a, b) => b.ready - a.ready || b.total - a.total)
          .slice(0, 12)
      );
    })();
  }, []);

  async function emailsForCity(city: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("fans")
      .select("email, first_name, would_attend")
      .ilike("city", city)
      .limit(80);
    return (data || [])
      .map((f) => (f.email as string)?.trim())
      .filter(Boolean) as string[];
  }

  async function inviteCity(city: string) {
    setBusyCity(city);
    setMsg(null);
    try {
      const emails = await emailsForCity(city);
      if (emails.length === 0) {
        setMsg(`No emails on file for ${city}`);
        return;
      }
      const subject = encodeURIComponent(
        `You're on my list in ${city} — small room soon`
      );
      const body = encodeURIComponent(
        `Hey,\n\nYou're on my fan list in ${city}. I'm putting together a small gathering and wanted you to know first.\n\nReply to this email if you'd show up — or watch for the room link.\n\n— Your artist via Omniv`
      );
      const bcc = emails.slice(0, 40).join(",");
      window.open(
        `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${subject}&body=${body}`
      );
      setMsg(`Invite draft opened for ${emails.length} fans in ${city}`);
    } finally {
      setBusyCity(null);
    }
  }

  async function copyEmails(city: string) {
    setBusyCity(city);
    setMsg(null);
    try {
      const emails = await emailsForCity(city);
      if (!emails.length) {
        setMsg(`No emails for ${city}`);
        return;
      }
      await navigator.clipboard.writeText(emails.join(", "));
      setMsg(`Copied ${emails.length} emails for ${city}`);
    } finally {
      setBusyCity(null);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-omniv-gold" />
        <h2 className="text-sm font-semibold tracking-tight">Audience map</h2>
      </div>
      <p className="mt-1 text-xs text-omniv-text-muted">
        Cities ranked by fans who said they would attend. Invite the list in one
        click or host a room.
      </p>
      {msg && <p className="mt-2 text-xs text-omniv-gold">{msg}</p>}
      <ul className="mt-4 space-y-2">
        {rows.length === 0 && (
          <li className="text-xs text-omniv-text-muted">
            No city data yet. Fan Gate captures city + would attend.
          </li>
        )}
        {rows.map((r) => (
          <li
            key={r.city}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-omniv-border px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{r.city}</p>
              <p className="text-[11px] text-omniv-text-muted">
                {r.total} fans · {r.ready} would attend
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 text-[11px]"
                disabled={busyCity === r.city}
                onClick={() => void inviteCity(r.city)}
              >
                {busyCity === r.city ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Mail className="h-3 w-3" />
                )}
                Invite
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 text-[11px]"
                disabled={busyCity === r.city}
                onClick={() => void copyEmails(r.city)}
              >
                <Copy className="h-3 w-3" />
                Emails
              </Button>
              {onCreateGathering && (
                <Button
                  size="sm"
                  className="h-8 text-[11px]"
                  onClick={() => onCreateGathering(r.city, r.ready)}
                >
                  Host room
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
