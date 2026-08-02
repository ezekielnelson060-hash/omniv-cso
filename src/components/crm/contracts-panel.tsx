"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRoster } from "@/lib/roster-context";
import { FileSignature, Plus, Trash2 } from "lucide-react";

export type ArtistContract = {
  id: string;
  artistId: string;
  artistName: string;
  title: string;
  type: "management" | "recording" | "publishing" | "booking" | "other";
  status: "draft" | "active" | "expired" | "terminated";
  startDate: string;
  endDate?: string;
  notes?: string;
  commissionPct?: number;
};

const STORAGE_KEY = "omniv_artist_contracts_v1";

function load(): ArtistContract[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as ArtistContract[];
  } catch {
    return [];
  }
}

function save(list: ArtistContract[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function ContractsPanel() {
  const { artists, active } = useRoster();
  const [contracts, setContracts] = useState<ArtistContract[]>([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ArtistContract["type"]>("management");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [commission, setCommission] = useState("15");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setContracts(load());
  }, []);

  const filtered = active
    ? contracts.filter((c) => c.artistId === active.id)
    : contracts;

  function add() {
    if (!active || !title.trim() || !startDate) return;
    const row: ArtistContract = {
      id: crypto.randomUUID(),
      artistId: active.id,
      artistName: active.stage_name,
      title: title.trim(),
      type,
      status: "active",
      startDate,
      endDate: endDate || undefined,
      notes: notes.trim() || undefined,
      commissionPct: Number(commission) || undefined,
    };
    const next = [row, ...contracts];
    setContracts(next);
    save(next);
    setTitle("");
    setNotes("");
  }

  function remove(id: string) {
    const next = contracts.filter((c) => c.id !== id);
    setContracts(next);
    save(next);
  }

  function setStatus(id: string, status: ArtistContract["status"]) {
    const next = contracts.map((c) => (c.id === id ? { ...c, status } : c));
    setContracts(next);
    save(next);
  }

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-omniv-gold/15">
          <FileSignature className="h-5 w-5 text-omniv-gold" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Artist contracts</h3>
          <p className="mt-0.5 text-xs text-omniv-text-muted">
            Track management, recording, and booking agreements per roster artist.
            Not legal advice — operational memory for the team.
          </p>
        </div>
      </div>

      {!active ? (
        <p className="text-xs text-omniv-text-muted">
          Select or add a roster artist first.
        </p>
      ) : (
        <>
          <p className="mb-3 text-xs text-omniv-text-secondary">
            Logging for <strong className="text-omniv-text">{active.stage_name}</strong>
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Agreement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ArtistContract["type"])}
              className="rounded-[var(--radius)] border border-omniv-border bg-omniv-elevated px-3 py-2 text-sm focus-gold"
            >
              <option value="management">Management</option>
              <option value="recording">Recording</option>
              <option value="publishing">Publishing</option>
              <option value="booking">Booking</option>
              <option value="other">Other</option>
            </select>
            <Input
              type="date"
              label="Start"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              label="End (optional)"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Input
              label="Commission %"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              placeholder="15"
            />
            <Input
              placeholder="Notes / renewal terms"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <Button size="sm" className="mt-3 gap-1.5" onClick={add}>
            <Plus className="h-3.5 w-3.5" />
            Add contract
          </Button>
        </>
      )}

      <ul className="mt-4 space-y-2">
        {filtered.length === 0 && (
          <li className="text-xs text-omniv-text-muted">No contracts logged yet.</li>
        )}
        {filtered.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-omniv-border bg-omniv-elevated/30 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-omniv-text">{c.title}</p>
              <p className="text-[11px] text-omniv-text-muted">
                {c.artistName} · {c.type} · {c.startDate}
                {c.endDate ? ` → ${c.endDate}` : ""}
                {c.commissionPct != null ? ` · ${c.commissionPct}%` : ""}
              </p>
              {c.notes && (
                <p className="mt-1 text-xs text-omniv-text-secondary">{c.notes}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={c.status}
                onChange={(e) =>
                  setStatus(c.id, e.target.value as ArtistContract["status"])
                }
                className="rounded-lg border border-omniv-border bg-omniv-elevated px-2 py-1 text-[11px]"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
              <Badge
                variant={
                  c.status === "active"
                    ? "success"
                    : c.status === "draft"
                      ? "outline"
                      : "gold"
                }
              >
                {c.status}
              </Badge>
              <button
                type="button"
                onClick={() => remove(c.id)}
                className="text-omniv-text-muted hover:text-omniv-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {artists.length > 1 && !active && (
        <p className="mt-2 text-[11px] text-omniv-text-muted">
          {contracts.length} contract(s) across roster — select an artist to filter.
        </p>
      )}
    </Card>
  );
}
