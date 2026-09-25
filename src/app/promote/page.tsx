"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";

type Pub = {
  id: string;
  title: string;
  type: string;
  slug: string;
  summary?: string;
};

const AUDIENCES = [
  "AI & Research",
  "African Tech",
  "Music",
  "Founders",
  "Investors",
  "Creators",
];

const LOCATIONS = [
  "Africa",
  "Nigeria",
  "Kenya",
  "South Africa",
  "Ghana",
  "Global",
];

const DURATIONS = [
  { id: "3", label: "3 days" },
  { id: "7", label: "7 days" },
  { id: "14", label: "14 days" },
];

const BUDGETS = [
  { id: "20", label: "$20" },
  { id: "50", label: "$50" },
  { id: "100", label: "$100" },
  { id: "custom", label: "Custom" },
];

function PromoteInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const preSlug = sp.get("slug") || "";

  const [pubs, setPubs] = useState<Pub[]>([]);
  const [slug, setSlug] = useState(preSlug);
  const [audience, setAudience] = useState("AI & Research");
  const [location, setLocation] = useState("Africa");
  const [duration, setDuration] = useState("7");
  const [budget, setBudget] = useState("50");
  const [customBudget, setCustomBudget] = useState("");
  const [auth, setAuth] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/discovery/publications/list?owner=me&limit=30");
        const data = await res.json();
        setAuth(data.auth !== false);
        const list = data.publications || [];
        setPubs(list);
        if (!preSlug && list[0]) setSlug(list[0].slug);
        if (preSlug) setSlug(preSlug);
      } catch {
        setAuth(false);
      }
    })();
  }, [preSlug]);

  const selected = pubs.find((p) => p.slug === slug);

  async function onContinue() {
    setLoading(true);
    // Store intent locally until ad billing is wired
    try {
      const payload = {
        slug,
        title: selected?.title,
        audience,
        location,
        duration,
        budget: budget === "custom" ? customBudget : budget,
        at: Date.now(),
      };
      localStorage.setItem("omniv_promote_draft", JSON.stringify(payload));
    } catch {
      /* ignore */
    }
    // Route to pricing / pro if they want full promote; mark done for now
    setDone(true);
    setLoading(false);
  }

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 md:max-w-2xl">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400"
            >
              ←
            </button>
            <span className="text-[16px] font-semibold text-white">
              Promote this publication
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4 md:max-w-2xl">
          {auth === false && (
            <div className="mt-10 text-center">
              <p className="text-zinc-500">Sign in to promote.</p>
              <Link
                href="/signup?next=/promote"
                className="mt-4 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
              >
                Sign in
              </Link>
            </div>
          )}

          {auth && done && (
            <div className="mt-8 rounded-2xl bg-emerald-500/10 p-6 text-center ring-1 ring-emerald-500/25">
              <p className="text-[16px] font-semibold text-emerald-300">
                Promotion request saved
              </p>
              <p className="mt-2 text-[13px] text-zinc-400">
                Targeted discovery for “{selected?.title || slug}”. Full paid
                boost ships with Pro billing — your settings are ready.
              </p>
              <Link
                href="/pricing"
                className="mt-5 inline-flex h-11 items-center rounded-full bg-omniv-gold px-5 text-[14px] font-semibold text-black"
              >
                Unlock with Pro
              </Link>
              <Link
                href={slug ? `/p/${slug}` : "/home"}
                className="mt-3 block text-[13px] text-zinc-500"
              >
                Back to publication
              </Link>
            </div>
          )}

          {auth && !done && (
            <div className="space-y-6">
              {/* Selected pub card */}
              {selected && (
                <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/[0.08]">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/20 text-omniv-gold">
                    ▣
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-white">
                      {selected.title}
                    </p>
                    <p className="text-[12px] capitalize text-zinc-500">
                      {selected.type}
                    </p>
                  </div>
                </div>
              )}

              {pubs.length > 1 && (
                <label className="block">
                  <span className="text-[12px] text-zinc-400">Publication</span>
                  <select
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3 text-[14px] text-white outline-none ring-1 ring-white/[0.08]"
                  >
                    {pubs.map((p) => (
                      <option key={p.id} value={p.slug} className="bg-zinc-900">
                        {p.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {pubs.length === 0 && (
                <p className="text-[14px] text-zinc-500">
                  Publish something first.{" "}
                  <Link href="/publish" className="text-omniv-gold">
                    Create →
                  </Link>
                </p>
              )}

              <Field label="Target audience">
                <div className="flex flex-wrap gap-2">
                  {AUDIENCES.map((a) => (
                    <Chip
                      key={a}
                      active={audience === a}
                      onClick={() => setAudience(a)}
                    >
                      {a}
                    </Chip>
                  ))}
                </div>
              </Field>

              <Field label="Location">
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map((l) => (
                    <Chip
                      key={l}
                      active={location === l}
                      onClick={() => setLocation(l)}
                    >
                      {l}
                    </Chip>
                  ))}
                </div>
              </Field>

              <Field label="Duration">
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <Chip
                      key={d.id}
                      active={duration === d.id}
                      onClick={() => setDuration(d.id)}
                    >
                      {d.label}
                    </Chip>
                  ))}
                </div>
              </Field>

              <Field label="Budget">
                <div className="flex flex-wrap gap-2">
                  {BUDGETS.map((b) => (
                    <Chip
                      key={b.id}
                      active={budget === b.id}
                      onClick={() => setBudget(b.id)}
                    >
                      {b.label}
                    </Chip>
                  ))}
                </div>
                {budget === "custom" && (
                  <input
                    type="number"
                    min={10}
                    value={customBudget}
                    onChange={(e) => setCustomBudget(e.target.value)}
                    placeholder="Amount in USD"
                    className="mt-3 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08]"
                  />
                )}
              </Field>

              <button
                type="button"
                disabled={loading || !slug}
                onClick={() => void onContinue()}
                className="flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black disabled:opacity-50"
              >
                {loading ? "Saving…" : "Continue"}
              </button>

              <p className="text-center text-[12px] text-zinc-600">
                Get more visibility with targeted discovery. Paid boost completes
                with Pro.
              </p>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-medium text-zinc-400">{label}</p>
      {children}
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
        active
          ? "bg-omniv-gold text-black"
          : "text-zinc-400 ring-1 ring-white/12"
      }`}
    >
      {children}
    </button>
  );
}

export default function PromotePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#050505] text-zinc-500">
          Loading…
        </div>
      }
    >
      <PromoteInner />
    </Suspense>
  );
}
