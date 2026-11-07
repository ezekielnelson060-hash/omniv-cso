"use client";

import { useState } from "react";

export function VisibilitySprintCheckoutForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/visibility-sprint/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          website: website.trim(),
          description: description.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.link) {
        setError(data.error || "Could not start checkout");
        setLoading(false);
        return;
      }
      window.location.href = data.link as string;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  const field =
    "mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white placeholder:text-zinc-600 outline-none focus:border-omniv-gold/50";

  return (
    <form
      id="get-sprint"
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.08] md:p-8"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
        Secure your sprint
      </p>
      <h2 className="mt-2 text-xl font-semibold text-white">
        Get Your Visibility Sprint
      </h2>
      <p className="mt-1.5 text-[13px] text-zinc-500">
        One-time payment of $300. You'll complete payment securely with
        Flutterwave.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-[12px] font-medium text-zinc-400">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
            placeholder="Your full name"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="text-[12px] font-medium text-zinc-400">
            Business email
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
            placeholder="you@company.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="text-[12px] font-medium text-zinc-400">
            Company / product name
          </label>
          <input
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={field}
            placeholder="Product or brand name"
          />
        </div>
        <div>
          <label className="text-[12px] font-medium text-zinc-400">
            Website <span className="text-zinc-600">(optional)</span>
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={field}
            placeholder="https://"
          />
        </div>
        <div>
          <label className="text-[12px] font-medium text-zinc-400">
            Product description
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${field} resize-y`}
            placeholder="What does your product do? Who is it for? Any recent launches or features we should highlight?"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 text-[13px] text-rose-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Redirecting to payment…" : "Get Your Visibility Sprint — $300"}
      </button>
      <p className="mt-3 text-center text-[11px] text-zinc-600">
        Secure card payment via Flutterwave. Order confirmed only after payment
        verification.
      </p>
    </form>
  );
}
