"use client";

import { useState } from "react";

export function ContactForm({
  entityName,
  entityPath,
}: {
  entityName: string;
  entityPath: string;
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
        body: JSON.stringify({ name, email, message, entityName, entityPath }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send");
        setStatus("err");
        return;
      }
      setStatus("ok");
      setMessage("");
    } catch {
      setError("Network error");
      setStatus("err");
    }
  }

  if (status === "ok") {
    return (
      <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-300">
        Message sent. They\'ll get back to you if the inbox is monitored.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        Contact
      </p>
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="h-10 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 text-[13px] text-white outline-none focus:border-omniv-gold/40"
      />
      <input
        required
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        className="h-10 w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 text-[13px] text-white outline-none focus:border-omniv-gold/40"
      />
      <textarea
        required
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What are you reaching out about?"
        className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-[13px] text-white outline-none focus:border-omniv-gold/40"
      />
      {error && <p className="text-[12px] text-rose-400">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="h-10 w-full rounded-full bg-white text-[13px] font-medium text-black disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
