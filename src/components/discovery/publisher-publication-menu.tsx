"use client";

import { useState } from "react";
import Link from "next/link";

export function PublisherPublicationMenu({
  id,
  slug,
  title,
  visibility = "public",
}: {
  id: string;
  slug: string;
  title: string;
  visibility?: "public" | "private";
}) {
  const [open, setOpen] = useState(false);
  const [currentVisibility, setCurrentVisibility] = useState(visibility);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function updateVisibility(next: "public" | "private") {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/discovery/publications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, visibility: next }),
      });
      if (!res.ok) throw new Error("Could not update visibility");
      setCurrentVisibility(next);
      setMessage(next === "private" ? "Private publication" : "Now public");
    } catch {
      setMessage("Could not update publication");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/discovery/publications?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) window.location.href = "/publications";
    else {
      setMessage("Could not delete publication");
      setBusy(false);
    }
  }

  async function share() {
    const url = `${window.location.origin}/p/${slug}`;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        setMessage("Link copied");
      }
    } catch {
      /* dismissed */
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Publication options"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-lg tracking-[0.2em] text-white/80 backdrop-blur transition hover:bg-black/55 hover:text-white"
      >
        <span aria-hidden>···</span>
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close options" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-48 rounded-2xl bg-[#111] p-1.5 shadow-2xl ring-1 ring-white/10">
            <Link href={`/publish?edit=${encodeURIComponent(id)}`} className="block rounded-xl px-3 py-2.5 text-[13px] text-zinc-200 hover:bg-white/[0.07]">Edit publication</Link>
            <button type="button" onClick={() => void share()} className="block w-full rounded-xl px-3 py-2.5 text-left text-[13px] text-zinc-200 hover:bg-white/[0.07]">Share link</button>
            <button type="button" disabled={busy} onClick={() => void updateVisibility(currentVisibility === "public" ? "private" : "public")} className="block w-full rounded-xl px-3 py-2.5 text-left text-[13px] text-zinc-200 hover:bg-white/[0.07] disabled:opacity-50">Make {currentVisibility === "public" ? "private" : "public"}</button>
            <button type="button" disabled={busy} onClick={() => void remove()} className="block w-full rounded-xl px-3 py-2.5 text-left text-[13px] text-red-300 hover:bg-red-400/10 disabled:opacity-50">Delete publication</button>
            {(message || currentVisibility === "private") && <p className="px-3 pb-2 pt-1 text-[11px] text-omniv-gold">{message || "Private publication"}</p>}
          </div>
        </>
      )}
    </div>
  );
}
