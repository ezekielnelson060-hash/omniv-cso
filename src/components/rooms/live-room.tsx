"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  MapPin,
  Ticket,
  Radio,
  Users,
  MessageCircle,
  Heart,
  ExternalLink,
  Mic2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Gathering = {
  id: string;
  title: string;
  city: string | null;
  capacity: number | null;
  ticket_price_cents: number | null;
  status: string;
  venue: string | null;
  room_type?: string | null;
  now_playing_url?: string | null;
  now_playing_title?: string | null;
  industry_guest_name?: string | null;
  industry_guest_role?: string | null;
  industry_guest_active?: boolean | null;
};

type ChatLine = {
  id: string;
  display_name: string;
  body: string;
  kind: string;
  created_at: string;
};

const ROOM_LABELS: Record<string, string> = {
  standard: "Gathering",
  drop_party: "Drop Party",
  co_dj: "Fan Co-DJ",
  a_r: "Live A&R",
};

export function LiveRoom() {
  const params = useParams();
  const search = useSearchParams();
  const id = String(params.id || "");
  const paid = search.get("paid") === "1";
  const isHost = search.get("host") === "1";

  const [g, setG] = useState<Gathering | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [tip, setTip] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(
    paid ? "Payment received. You are in the room." : null
  );
  const [error, setError] = useState<string | null>(null);
  const [listeners, setListeners] = useState(1);
  const [chat, setChat] = useState<ChatLine[]>([]);
  const [chatText, setChatText] = useState("");
  const [tipsFlash, setTipsFlash] = useState<string[]>([]);
  const [playUrl, setPlayUrl] = useState("");
  const [playTitle, setPlayTitle] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestRole, setGuestRole] = useState("");
  const [guestOn, setGuestOn] = useState(false);
  const [hostBusy, setHostBusy] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/gatherings/${id}/messages`);
      if (res.ok) {
        const data = (await res.json()) as { messages: ChatLine[] };
        setChat(data.messages || []);
      }
    } catch {
      /* ignore */
    }
  }, [id]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`/api/gatherings/${id}`);
        if (res.ok) {
          const data = (await res.json()) as { gathering: Gathering };
          setG(data.gathering);
          setPlayUrl(data.gathering.now_playing_url || "");
          setPlayTitle(data.gathering.now_playing_title || "");
          setGuestName(data.gathering.industry_guest_name || "");
          setGuestRole(data.gathering.industry_guest_role || "");
          setGuestOn(Boolean(data.gathering.industry_guest_active));
        }
      } finally {
        setLoading(false);
      }
    })();
    void loadMessages();
  }, [id, loadMessages]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !id) return;
    let channel: ReturnType<ReturnType<typeof createClient>["channel"]> | null =
      null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel(`room:${id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "room_messages",
            filter: `gathering_id=eq.${id}`,
          },
          (payload) => {
            const row = payload.new as ChatLine;
            setChat((prev) => {
              if (prev.some((m) => m.id === row.id)) return prev;
              return [...prev, row].slice(-120);
            });
            if (row.kind === "join") setListeners((n) => n + 1);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "gatherings",
            filter: `id=eq.${id}`,
          },
          (payload) => {
            const row = payload.new as Gathering;
            setG((prev) => (prev ? { ...prev, ...row } : row));
          }
        )
        .subscribe();
    } catch {
      const t = setInterval(() => void loadMessages(), 8000);
      return () => clearInterval(t);
    }
    return () => {
      if (channel && isSupabaseConfigured()) {
        try {
          createClient().removeChannel(channel);
        } catch {
          /* ignore */
        }
      }
    };
  }, [id, loadMessages]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  async function postChat(text: string, kind = "chat") {
    const res = await fetch(`/api/gatherings/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: name.trim() || "Guest",
        text,
        kind,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { message?: ChatLine };
      if (data.message) {
        setChat((prev) => {
          if (prev.some((m) => m.id === data.message!.id)) return prev;
          return [...prev, data.message!];
        });
      }
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    setMsg("Reserving…");
    try {
      const res = await fetch("/api/gatherings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gatheringId: id,
          email: email.trim(),
          name: name.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        link?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setError(data.error || "Could not complete");
        setMsg(null);
        return;
      }
      if (data.link) {
        window.location.href = data.link;
        return;
      }
      setMsg(data.message || "You are on the list");
      void postChat("joined the room", "join");
      setListeners((n) => n + 1);
    } catch {
      setError("Network error");
      setMsg(null);
    } finally {
      setBusy(false);
    }
  }

  async function sendTip() {
    if (!email.trim() || !tip || Number(tip) <= 0) return;
    const amount = Number(tip);
    const flash = `${name.trim() || "Someone"} tipped $${amount}`;
    setTipsFlash((f) => [flash, ...f].slice(0, 5));
    void postChat(`tipped $${amount}`, "tip");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/gatherings/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gatheringId: id,
          email: email.trim(),
          name: name.trim() || undefined,
          tipUsd: amount,
        }),
      });
      const data = (await res.json()) as { link?: string; error?: string };
      if (!res.ok || !data.link) {
        setError(data.error || "Tip failed");
        setTipsFlash((f) => f.filter((x) => x !== flash));
        return;
      }
      window.location.href = data.link;
    } catch {
      setError("Network error");
      setTipsFlash((f) => f.filter((x) => x !== flash));
    } finally {
      setBusy(false);
    }
  }

  async function saveHostLive() {
    setHostBusy(true);
    try {
      const res = await fetch(`/api/gatherings/${id}/live`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nowPlayingUrl: playUrl,
          nowPlayingTitle: playTitle,
          industryGuestName: guestName,
          industryGuestRole: guestRole,
          industryGuestActive: guestOn,
        }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error || "Host update failed — sign in as room owner");
        return;
      }
      setMsg("Live controls saved. Fans see now playing in real time.");
    } finally {
      setHostBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-omniv-black text-sm text-omniv-text-muted">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-omniv-gold" />
        Opening room…
      </div>
    );
  }

  if (!g) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-omniv-black px-5 text-center">
        <p className="text-sm text-omniv-text-secondary">Room not found.</p>
        <Link href="/">
          <Button size="sm" variant="outline">
            Omniv home
          </Button>
        </Link>
      </div>
    );
  }

  const price = ((g.ticket_price_cents || 0) / 100).toFixed(2);
  const isFree = Number(g.ticket_price_cents || 0) <= 0;
  const roomLabel = ROOM_LABELS[g.room_type || "standard"] || "Gathering";

  return (
    <div className="relative min-h-dvh bg-omniv-black px-4 py-8 md:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.1),_transparent_50%)]" />
      <div className="relative z-10 mx-auto grid max-w-5xl gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-rose-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                </span>
                Live
              </span>
              <span className="rounded-full border border-omniv-gold/30 px-2 py-0.5 text-[10px] text-omniv-gold">
                {roomLabel}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-omniv-text-muted">
                <Users className="h-3.5 w-3.5" />
                {listeners} in room
              </span>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
              Omniv · Rooms 2.0
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-omniv-border bg-omniv-card">
            <div className="flex flex-col items-center justify-center bg-gradient-to-b from-omniv-gold/10 to-transparent p-6">
              <Radio className="mb-3 h-10 w-10 text-omniv-gold" />
              <h1 className="text-center text-xl font-semibold tracking-tight md:text-2xl">
                {g.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-omniv-text-secondary">
                {g.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {g.city}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Ticket className="h-3.5 w-3.5" />
                  {isFree ? "Free entry" : `$${price}`}
                </span>
              </div>

              {g.now_playing_title || g.now_playing_url ? (
                <div className="mt-5 w-full max-w-md rounded-xl border border-omniv-gold/30 bg-omniv-black/40 p-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-omniv-gold">
                    Now playing
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {g.now_playing_title || "Host stream"}
                  </p>
                  {g.now_playing_url && (
                    <a
                      href={g.now_playing_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[11px] text-omniv-gold underline"
                    >
                      Open listen link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              ) : (
                <p className="mt-4 max-w-sm text-center text-[11px] text-omniv-text-muted">
                  Host sets the track link. Everyone follows the same play.
                </p>
              )}

              {g.industry_guest_active && g.industry_guest_name && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-omniv-border px-3 py-2 text-[12px]">
                  <Mic2 className="h-3.5 w-3.5 text-omniv-gold" />
                  <span>
                    <span className="font-medium text-omniv-gold">
                      {g.industry_guest_name}
                    </span>
                    {g.industry_guest_role
                      ? ` · ${g.industry_guest_role}`
                      : " · Industry guest"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {tipsFlash.length > 0 && (
            <div className="space-y-1">
              {tipsFlash.map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-2 rounded-lg border border-omniv-gold/30 bg-omniv-gold/10 px-3 py-1.5 text-[12px] text-omniv-gold"
                >
                  <Heart className="h-3.5 w-3.5" />
                  {t}
                </div>
              ))}
            </div>
          )}

          <div className="flex h-72 flex-col overflow-hidden rounded-2xl border border-omniv-border bg-omniv-card">
            <div className="flex items-center gap-2 border-b border-omniv-border px-3 py-2">
              <MessageCircle className="h-3.5 w-3.5 text-omniv-gold" />
              <span className="text-[11px] font-medium">Live chat</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto px-3 py-2">
              {chat.length === 0 && (
                <p className="text-[11px] text-omniv-text-muted">
                  Be first. Messages sync when Realtime replication is on.
                </p>
              )}
              {chat.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "text-[12px]",
                    c.kind === "system" && "text-omniv-gold/90",
                    c.kind === "tip" && "text-omniv-gold font-medium"
                  )}
                >
                  <span className="font-medium text-omniv-gold">
                    {c.display_name}
                  </span>
                  <span className="text-omniv-text-muted"> · {c.body}</span>
                </div>
              ))}
              <div ref={chatEnd} />
            </div>
            <form
              className="flex gap-2 border-t border-omniv-border p-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatText.trim()) return;
                void postChat(chatText.trim());
                setChatText("");
              }}
            >
              <Input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Message the room"
                className="h-9 text-xs"
              />
              <Button type="submit" size="sm" className="h-9 shrink-0">
                Send
              </Button>
            </form>
          </div>
        </div>

        <div className="space-y-3">
          {isHost && (
            <div className="space-y-2 rounded-2xl border border-omniv-gold/30 bg-omniv-gold/5 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
                Host controls
              </p>
              <Input
                placeholder="Now playing title"
                value={playTitle}
                onChange={(e) => setPlayTitle(e.target.value)}
                className="h-9 text-xs"
              />
              <Input
                placeholder="Stream / Spotify / YouTube URL"
                value={playUrl}
                onChange={(e) => setPlayUrl(e.target.value)}
                className="h-9 text-xs"
              />
              <Input
                placeholder="Industry guest name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="h-9 text-xs"
              />
              <Input
                placeholder="Guest role (A&R, sync, etc.)"
                value={guestRole}
                onChange={(e) => setGuestRole(e.target.value)}
                className="h-9 text-xs"
              />
              <label className="flex items-center gap-2 text-[11px] text-omniv-text-secondary">
                <input
                  type="checkbox"
                  checked={guestOn}
                  onChange={(e) => setGuestOn(e.target.checked)}
                />
                Show industry guest on stage
              </label>
              <Button
                size="sm"
                className="h-9 w-full"
                disabled={hostBusy}
                onClick={() => void saveHostLive()}
              >
                {hostBusy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Push to room"
                )}
              </Button>
              <p className="text-[10px] text-omniv-text-muted">
                Open with ?host=1 while signed in as room owner.
              </p>
            </div>
          )}

          <form
            onSubmit={submit}
            className="space-y-3 rounded-2xl border border-omniv-border bg-omniv-card p-4"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
              Enter room
            </p>
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl"
            />
            <Input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-xl"
            />
            {error && <p className="text-xs text-rose-400">{error}</p>}
            {msg && <p className="text-xs text-omniv-gold">{msg}</p>}
            <Button
              type="submit"
              disabled={busy || !email.trim() || g.status !== "open"}
              className="h-10 w-full rounded-xl font-semibold"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isFree ? (
                "RSVP free"
              ) : (
                `Pay $${price} · reserve`
              )}
            </Button>
          </form>

          <div className="rounded-2xl border border-omniv-border bg-omniv-card/80 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
              Tip jar
            </p>
            <div className="mt-3 flex gap-2">
              <Input
                type="number"
                min={1}
                placeholder="USD"
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                className="h-10 rounded-xl"
              />
              <Button
                type="button"
                variant="outline"
                disabled={busy || !email.trim() || !tip || Number(tip) <= 0}
                className="h-10 shrink-0"
                onClick={() => void sendTip()}
              >
                Tip
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
