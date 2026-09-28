"use client";

import { useState } from "react";
import { recordSignal } from "@/lib/discovery/signals";

export function ContactForm({
  entityName,
  entityPath,
  entityId,
  ownerId,
}: {
  entityName: string;
  entityPath: string;
  entityId?: string | null;
  ownerId?: string | null;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/discovery/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          entityName,
          entityPath,
          entityId,
          ownerId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send");
        setStatus("err");
        return;
      }
      setStatus("ok");
      setMessage("");
      recordSignal("contact", [entityName, entityPath].filter(Boolean));
    } catch {
      setError("Network error");
      setStatus("err");
    }
  }

  if (status === "ok") {
    return (
      <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-300 ring-1 ring-emerald-500/25">
        Message sent. They&apos;ll get back to you if the inbox is monitored.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.08]"
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Connect
        </p>
        <p className="mt-1 text-[13px] text-zinc-400">
          Reach out to {entityName}
        </p>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        required
        className="h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus:ring-omniv-gold/40"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus:ring-omniv-gold/40"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message"
        required
        rows={4}
        className="w-full rounded-xl bg-white/[0.04] px-3.5 py-3 text-[14px] text-white outline-none ring-1 ring-white/[0.08] placeholder:text-zinc-600 focus:ring-omniv-gold/40"
      />
      {error && (
        <p className="text-[12px] text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="flex h-11 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
