"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  Calendar,
  Loader2,
  Plus,
  Copy,
  ExternalLink,
  Pencil,
  Check,
  X,
} from "lucide-react";

type Gathering = {
  id: string;
  title: string;
  city: string | null;
  venue: string | null;
  capacity: number | null;
  ticket_price_cents: number | null;
  status: string;
  starts_at: string | null;
  notes: string | null;
};

export function GatheringsPanel({
  seedCity,
  seedReady,
}: {
  seedCity?: string | null;
  seedReady?: number | null;
}) {
  const [rows, setRows] = useState<Gathering[]>([]);
  const [title, setTitle] = useState("");
  const [city, setCity] = useState(seedCity || "");
  const [capacity, setCapacity] = useState(
    seedReady ? String(Math.min(seedReady, 40)) : "20"
  );
  const [price, setPrice] = useState("0");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    title: "",
    city: "",
    venue: "",
    capacity: "",
    price: "",
    status: "open",
    starts_at: "",
    notes: "",
  });

  useEffect(() => {
    if (seedCity) setCity(seedCity);
    if (seedReady) setCapacity(String(Math.min(seedReady, 40)));
  }, [seedCity, seedReady]);

  async function load() {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("gatherings")
      .select(
        "id, title, city, venue, capacity, ticket_price_cents, status, starts_at, notes"
      )
      .order("created_at", { ascending: false })
      .limit(20);
    setRows((data as Gathering[]) || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      if (!isSupabaseConfigured()) {
        setMsg("Sign in and run gatherings SQL first");
        return;
      }
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setMsg("Sign in required");
        return;
      }
      const cents = Math.round(Number(price || 0) * 100);
      const { error } = await supabase.from("gatherings").insert({
        user_id: user.id,
        title: title.trim(),
        city: city.trim() || null,
        capacity: Number(capacity) || 20,
        ticket_price_cents: cents,
        status: "open",
        notes: seedReady
          ? `Seeded from audience map: ${seedReady} fans marked would attend`
          : null,
      });
      if (error) {
        setMsg(error.message);
        return;
      }
      setTitle("");
      setMsg("Gathering open. Share the room link so fans can RSVP and pay.");
      await load();
    } finally {
      setBusy(false);
    }
  }

  function startEdit(g: Gathering) {
    setEditId(g.id);
    setDraft({
      title: g.title,
      city: g.city || "",
      venue: g.venue || "",
      capacity: String(g.capacity || 20),
      price: String(((g.ticket_price_cents || 0) / 100).toFixed(2)),
      status: g.status || "open",
      starts_at: g.starts_at
        ? new Date(g.starts_at).toISOString().slice(0, 16)
        : "",
      notes: g.notes || "",
    });
  }

  async function saveEdit() {
    if (!editId) return;
    setBusy(true);
    setMsg(null);
    try {
      const supabase = createClient();
      const cents = Math.round(Number(draft.price || 0) * 100);
      const { error } = await supabase
        .from("gatherings")
        .update({
          title: draft.title.trim(),
          city: draft.city.trim() || null,
          venue: draft.venue.trim() || null,
          capacity: Number(draft.capacity) || 20,
          ticket_price_cents: cents,
          status: draft.status,
          starts_at: draft.starts_at
            ? new Date(draft.starts_at).toISOString()
            : null,
          notes: draft.notes.trim() || null,
        })
        .eq("id", editId);
      if (error) {
        setMsg(error.message);
        return;
      }
      setEditId(null);
      setMsg("Room updated. Public link shows the new details.");
      await load();
    } finally {
      setBusy(false);
    }
  }

  function roomUrl(id: string) {
    if (typeof window === "undefined") return `/g/${id}`;
    return `${window.location.origin}/g/${id}`;
  }

  async function copyLink(id: string) {
    await navigator.clipboard.writeText(roomUrl(id));
    setMsg("Room link copied");
  }

  function inviteMail(g: Gathering) {
    const link = roomUrl(g.id);
    const cityLabel = g.city || "your city";
    const subject = encodeURIComponent(
      `${g.title} — small room in ${cityLabel}`
    );
    const body = encodeURIComponent(
      `You are on my list in ${cityLabel}.\n\nI am hosting a small gathering: ${g.title}.\n\nReserve here: ${link}\n\nSee you in the room.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-omniv-gold" />
        <h2 className="text-sm font-semibold tracking-tight">Gatherings</h2>
      </div>
      <p className="mt-1 text-xs text-omniv-text-muted">
        Each event gets its own public link. Edit anytime — fans always see the
        latest title, city, price, and tip jar.
      </p>

      <form onSubmit={create} className="mt-4 grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="Title (e.g. Listening session)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="sm:col-span-2"
        />
        <Input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <Input
          placeholder="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          type="number"
          min={5}
          max={200}
        />
        <Input
          placeholder="Ticket price (USD, 0 = free)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          min={0}
          step="0.01"
          className="sm:col-span-2"
        />
        <Button
          type="submit"
          disabled={busy}
          className="gap-1.5 sm:col-span-2 sm:w-auto"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Open gathering
        </Button>
      </form>
      {msg && <p className="mt-2 text-xs text-omniv-gold">{msg}</p>}

      <ul className="mt-4 space-y-3">
        {rows.map((g) => {
          const dollars = ((g.ticket_price_cents || 0) / 100).toFixed(2);
          const isEditing = editId === g.id;
          return (
            <li
              key={g.id}
              className="rounded-xl border border-omniv-border px-3 py-2.5 text-sm"
            >
              {isEditing ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Title"
                    value={draft.title}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, title: e.target.value }))
                    }
                    className="sm:col-span-2"
                  />
                  <Input
                    placeholder="City"
                    value={draft.city}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, city: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Venue"
                    value={draft.venue}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, venue: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Capacity"
                    type="number"
                    value={draft.capacity}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, capacity: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Price USD"
                    type="number"
                    step="0.01"
                    value={draft.price}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, price: e.target.value }))
                    }
                  />
                  <Input
                    type="datetime-local"
                    value={draft.starts_at}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, starts_at: e.target.value }))
                    }
                  />
                  <select
                    className="h-10 rounded-lg border border-omniv-border bg-omniv-elevated px-3 text-sm"
                    value={draft.status}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, status: e.target.value }))
                    }
                  >
                    <option value="draft">draft</option>
                    <option value="open">open</option>
                    <option value="sold_out">sold_out</option>
                    <option value="done">done</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                  <Input
                    placeholder="Description / notes"
                    value={draft.notes}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, notes: e.target.value }))
                    }
                    className="sm:col-span-2"
                  />
                  <div className="flex gap-2 sm:col-span-2">
                    <Button
                      size="sm"
                      className="gap-1"
                      disabled={busy}
                      onClick={() => void saveEdit()}
                    >
                      <Check className="h-3.5 w-3.5" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditId(null)}
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-medium">{g.title}</span>
                    <span className="text-omniv-text-muted">
                      {" "}
                      · {g.city || "TBD"}
                      {g.venue ? ` · ${g.venue}` : ""} · cap{" "}
                      {g.capacity || "—"} · ${dollars} · {g.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-[11px]"
                      onClick={() => startEdit(g)}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-[11px]"
                      onClick={() => void copyLink(g.id)}
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                    <a href={`/g/${g.id}`} target="_blank" rel="noreferrer">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-[11px]"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-[11px]"
                      onClick={() => inviteMail(g)}
                    >
                      Invite
                    </Button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
