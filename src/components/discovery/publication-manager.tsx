"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAccountSwitch, readActiveAccount, type ActiveAccount } from "@/lib/discovery/active-account";
import { PUBLICATION_LABELS, type PublicationType } from "@/lib/discovery/types";

export type ManagedPublication = {
  id: string;
  type: PublicationType;
  slug: string;
  title: string;
  summary: string;
  publisherId: string | null;
  publisherName: string | null;
  status: "draft" | "published" | "archived";
  updatedAt: string | null;
  publishedAt: string | null;
  heat: number | null;
  tags: string[];
};

export function PublicationManager({ mode }: { mode: "drafts" | "publications" }) {
  const [active, setActive] = useState<ActiveAccount | null>(null);
  const [status, setStatus] = useState<"published" | "draft" | "archived">(mode === "drafts" ? "draft" : "published");
  const [items, setItems] = useState<ManagedPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function load(account = active, requestedStatus = status) {
    setLoading(true);
    const query = new URLSearchParams({ status: requestedStatus });
    if (account?.id) query.set("publisherId", account.id);
    try {
      const res = await fetch(`/api/discovery/publications?${query.toString()}`);
      const data = await res.json();
      setItems(res.ok ? data.publications || [] : []);
      if (!res.ok) setMessage(data.error || "Sign in to view your publications");
    } catch {
      setMessage("Could not load publications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const account = readActiveAccount();
    setActive(account);
    void load(account, status);
    return onAccountSwitch((next) => {
      setActive(next);
      void load(next, status);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeStatus(next: "published" | "draft" | "archived") {
    setStatus(next);
    void load(active, next);
  }

  async function updatePublication(id: string, next: "published" | "archived") {
    const res = await fetch("/api/discovery/publications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    if (res.ok) {
      setItems((current) => current.filter((item) => item.id !== id));
      setMessage(next === "published" ? "Publication is live" : "Publication archived");
    } else {
      const data = await res.json();
      setMessage(data.error || "Could not update publication");
    }
  }

  async function deleteDraft(id: string) {
    const res = await fetch(`/api/discovery/publications?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (res.ok) setItems((current) => current.filter((item) => item.id !== id));
    else setMessage("Only drafts can be deleted");
  }

  const title = mode === "drafts" ? "Drafts" : "Publications";
  return (
    <div className="min-h-dvh bg-[#050505] text-zinc-100">
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-12 md:px-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-omniv-gold">Publish</p><h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">{title}</h1><p className="mt-2 text-[14px] text-zinc-500">Publishing as <span className="text-zinc-200">{active?.name || "your personal identity"}</span></p></div>
          <Link href="/publish" className="inline-flex h-11 items-center justify-center rounded-full bg-omniv-gold px-5 text-[13px] font-semibold text-black">+ Publish</Link>
        </div>
        {mode === "publications" && <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4"><Metric label="Views" value="—" /><Metric label="Saves" value="—" /><Metric label="Followers generated" value="—" /><Metric label="Shares" value="—" /></div>}
        {mode === "publications" && <div className="mt-8 flex gap-5 border-b border-white/[0.08] pb-3 text-[12px]">{(["published", "draft", "archived"] as const).map((tab) => <button key={tab} type="button" onClick={() => changeStatus(tab)} className={`capitalize ${status === tab ? "font-semibold text-omniv-gold" : "text-zinc-600 hover:text-white"}`}>{tab}</button>)}</div>}
        {message && <p className="mt-6 rounded-xl bg-omniv-gold/10 px-4 py-3 text-[13px] text-omniv-gold">{message}</p>}
        {loading ? <p className="py-16 text-center text-[14px] text-zinc-600">Loading your publications…</p> : items.length === 0 ? <EmptyState mode={mode} status={status} /> : <div className="mt-6 space-y-3">{items.map((item) => <PublicationRow key={item.id} item={item} mode={mode} onPublish={() => void updatePublication(item.id, "published")} onArchive={() => void updatePublication(item.id, "archived")} onDelete={() => void deleteDraft(item.id)} />)}</div>}
      </main>
    </div>
  );
}

function PublicationRow({ item, mode, onPublish, onArchive, onDelete }: { item: ManagedPublication; mode: "drafts" | "publications"; onPublish: () => void; onArchive: () => void; onDelete: () => void }) {
  return <article className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.07]"><div className="flex gap-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">{PUBLICATION_LABELS[item.type]}</span><span className="text-[11px] text-zinc-600">{item.publisherName || "Personal"}</span></div><h2 className="mt-2 truncate text-[17px] font-semibold text-white">{item.title}</h2><p className="mt-1 line-clamp-2 text-[13px] text-zinc-500">{item.summary}</p><p className="mt-3 text-[11px] text-zinc-600">{item.updatedAt ? `Last edited ${new Date(item.updatedAt).toLocaleDateString()}` : "Saved locally"} · {item.status}</p></div><div className="flex shrink-0 flex-col gap-2"><Link href={`/publish?draft=${item.id}`} className="rounded-full bg-white/[0.06] px-3 py-2 text-center text-[11px] text-zinc-300 ring-1 ring-white/10">Continue editing</Link>{mode === "drafts" ? <><button type="button" onClick={onPublish} className="rounded-full bg-omniv-gold px-3 py-2 text-[11px] font-semibold text-black">Publish</button><button type="button" onClick={onDelete} className="px-3 py-1 text-[11px] text-zinc-600 hover:text-red-400">Delete</button></> : <button type="button" onClick={onArchive} className="px-3 py-1 text-[11px] text-zinc-600 hover:text-white">Archive</button>}</div></div></article>;
}

function EmptyState({ mode, status }: { mode: string; status: string }) {
  return <div className="py-20 text-center"><p className="text-[15px] text-zinc-400">{mode === "drafts" ? "Nothing waiting in drafts." : `No ${status} publications for this identity.`}</p><Link href="/publish" className="mt-4 inline-flex text-[13px] text-omniv-gold hover:underline">Start publishing →</Link></div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/[0.07]"><p className="text-[11px] text-zinc-600">{label}</p><p className="mt-2 text-lg font-semibold text-white">{value}</p></div>; }
