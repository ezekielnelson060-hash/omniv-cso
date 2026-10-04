"use client";

import { useState } from "react";
import Link from "next/link";

export function PublisherPublicationMenu({
  id,
  slug,
  title,
  visibility = "public",
  status = "published",
}: {
  id: string;
  slug: string;
  title: string;
  visibility?: "public" | "private";
  status?: "draft" | "published" | "archived" | "scheduled";
}) {
  const [open, setOpen] = useState(false);
  const [currentVisibility, setCurrentVisibility] = useState(visibility);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function patchPublication(patch: Record<string, string>, success: string) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/discovery/publications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not update publication");
      if (patch.visibility) setCurrentVisibility(patch.visibility as "public" | "private");
      if (patch.status) setCurrentStatus(patch.status as typeof currentStatus);
      setMessage(success);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update publication");
    } finally {
      setBusy(false);
    }
  }

  async function copyShareLink() {
    const url = `${window.location.origin}/p/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copied");
    } catch {
      setMessage("Could not copy link");
    }
  }

  async function unpublish() {
    if (!window.confirm("Unpublish this publication? It will leave public discovery and return to your drafts.")) return;
    await patchPublication({ status: "draft" }, "Unpublished — saved to drafts");
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

  const menuLink = "block rounded-xl px-3 py-2.5 text-[13px] text-zinc-200 hover:bg-white/[0.07]";
  const menuButton = "block w-full rounded-xl px-3 py-2.5 text-left text-[13px] text-zinc-200 hover:bg-white/[0.07] disabled:opacity-50";

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
          <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl bg-[#111] p-1.5 shadow-2xl ring-1 ring-white/10">
            <Link href={`/publish?edit=${encodeURIComponent(id)}`} className={menuLink}>Edit</Link>
            <Link href={`/analytics?publication=${encodeURIComponent(id)}`} className={menuLink}>View analytics</Link>
            <Link href={`/promote?slug=${encodeURIComponent(slug)}`} className={menuLink}>Promote this article</Link>
            <Link href={`/invites?publication=${encodeURIComponent(slug)}`} className={menuLink}>Invite audience</Link>
            <button type="button" disabled={busy} onClick={() => void copyShareLink()} className={menuButton}>Copy share link</button>
            {currentVisibility === "public" ? (
              <button type="button" disabled={busy} onClick={() => void patchPublication({ visibility: "private" }, "Made private")} className={menuButton}>Make private</button>
            ) : (
              <button type="button" disabled={busy} onClick={() => void patchPublication({ visibility: "public" }, "Made public")} className={menuButton}>Make public</button>
            )}
            {currentStatus === "published" && (
              <button type="button" disabled={busy} onClick={() => void unpublish()} className={menuButton}>Unpublish</button>
            )}
            <button type="button" disabled={busy} onClick={() => void remove()} className="block w-full rounded-xl px-3 py-2.5 text-left text-[13px] text-red-300 hover:bg-red-400/10 disabled:opacity-50">Delete</button>
            {(message || currentVisibility === "private" || currentStatus === "draft") && <p className="px-3 pb-2 pt-1 text-[11px] text-omniv-gold">{message || (currentStatus === "draft" ? "Saved to drafts" : "Private publication")}</p>}
          </div>
        </>
      )}
    </div>
  );
}
