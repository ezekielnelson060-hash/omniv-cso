"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { startFlutterwaveCheckout } from "@/lib/checkout";
import { type PromotionTargetType } from "@/lib/discovery/monetization";

type Pub = {
  id: string;
  title: string;
  type: string;
  slug: string;
  summary?: string;
};
type Entity = { id: string; name: string; slug: string; type: string };

const TARGETS: { id: PromotionTargetType; label: string }[] = [
  { id: "publication", label: "Publication" },
  { id: "entity", label: "Entity" },
  { id: "product", label: "Product" },
  { id: "event", label: "Event" },
  { id: "opportunity", label: "Opportunity" },
];

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
  const billingOk = sp.get("billing") === "success";

  const [pubs, setPubs] = useState<Pub[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [slug, setSlug] = useState(preSlug);
  const [targetType, setTargetType] = useState<PromotionTargetType>("publication");
  const [audience, setAudience] = useState("AI & Research");
  const [location, setLocation] = useState("Africa");
  const [duration, setDuration] = useState("7");
  const [budget, setBudget] = useState("50");
  const [customBudget, setCustomBudget] = useState("");
  const [auth, setAuth] = useState<boolean | null>(null);
  const [done, setDone] = useState(billingOk);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState(false);

  useEffect(() => {
    if (billingOk) setDone(true);
  }, [billingOk]);

  useEffect(() => {
    (async () => {
      try {
        const [pubRes, entityRes] = await Promise.all([
          fetch(
          "/api/discovery/publications/list?owner=me&limit=30"
          ),
          fetch("/api/discovery/entities"),
        ]);
        const data = await pubRes.json();
        const entityData = await entityRes.json();
        setAuth(data.auth !== false);
        const list = data.publications || [];
        setPubs(list);
        setEntities(entityData.entities || []);
        if (!preSlug && list[0]) setSlug(list[0].slug);
        if (preSlug) setSlug(preSlug);
      } catch {
        setAuth(false);
      }
    })();
  }, [preSlug]);

  const candidates = targetType === "entity"
    ? entities.map((entity) => ({ id: entity.id, title: entity.name, slug: entity.slug, type: entity.type }))
    : targetType === "publication"
      ? pubs
      : pubs.filter((publication) => publication.type === targetType);
  const selected = candidates.find((item) => item.slug === slug);

  useEffect(() => {
    if (candidates.length > 0 && !candidates.some((item) => item.slug === slug)) {
      setSlug(candidates[0]!.slug);
    }
  }, [candidates, slug]);

  function budgetAmount() {
    if (budget === "custom") {
      const n = parseInt(customBudget, 10);
      return Number.isFinite(n) ? n : 50;
    }
    return parseInt(budget, 10) || 50;
  }

  async function onContinue() {
    setError(null);
    setLoading(true);
    const amount = budgetAmount();
    try {
      const payload = {
        slug,
        title: selected?.title,
        audience,
        location,
        duration,
        budget: amount,
        at: Date.now(),
      };
      localStorage.setItem("omniv_promote_draft", JSON.stringify(payload));
    } catch {
      /* ignore */
    }

    const draftRes = await fetch("/api/discovery/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType,
        targetId: selected?.id,
        targetSlug: slug,
        targetTitle: selected?.title || slug,
        durationDays: Number(duration),
        budget: amount,
        audience: [audience],
        location,
      }),
    });
    const draftData = await draftRes.json();
    if (!draftRes.ok) {
      setError(draftData.error || "Could not save promotion");
      setLoading(false);
      return;
    }
    const result = await startFlutterwaveCheckout({
      plan: "promote",
      amount,
      meta: {
        promotion_id: draftData.promotion.id,
        target_type: targetType,
        slug,
        audience,
        location,
        duration,
      },
    });

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    window.location.href = result.link;
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
              Promote
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
                {billingOk ? "Checkout returned" : "Promotion ready"}
              </p>
              <p className="mt-2 text-[13px] text-zinc-400">
                {billingOk
                  ? "We are waiting for the payment confirmation webhook. Your promotion will become active only after the transaction is verified."
                  : `Targeted discovery for “${selected?.title || slug}”. Review your settings before payment.`}
              </p>
              <Link
                href={slug ? `/p/${slug}` : "/home"}
                className="mt-5 inline-flex h-11 items-center rounded-full bg-omniv-gold px-5 text-[14px] font-semibold text-black"
              >
                Back to publication
              </Link>
            </div>
          )}

          {auth && !done && (
            <div className="space-y-6">
              <Field label="What do you want to promote?">
                <div className="flex flex-wrap gap-2">
                  {TARGETS.map((target) => <Chip key={target.id} active={targetType === target.id} onClick={() => setTargetType(target.id)}>{target.label}</Chip>)}
                </div>
              </Field>

              {candidates.length > 0 && (
                <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/[0.08]">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/20 text-omniv-gold">
                    ▣
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-white">
                      {selected?.title || "Choose a target"}
                    </p>
                    <p className="text-[12px] capitalize text-zinc-500">
                      {targetType}
                    </p>
                  </div>
                </div>
              )}

              {candidates.length > 1 && (
                <label className="block">
                  <span className="text-[12px] text-zinc-400">{targetType === "entity" ? "Entity" : "Content"}</span>
                  <select
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3 text-[14px] text-white outline-none ring-1 ring-white/[0.08]"
                  >
                    {candidates.map((p) => (
                      <option key={p.id} value={p.slug} className="bg-zinc-900">
                        {p.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {candidates.length === 0 && (
                <p className="text-[14px] text-zinc-500">
                  {targetType === "entity" ? "Create an entity first." : `Create a ${targetType} first.`}{" "}
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

              {error && (
                <p className="text-center text-[13px] text-rose-400">
                  {error}
                  {error.includes("Sign in") && (
                    <>
                      {" "}
                      <Link href="/signup?next=/promote" className="underline">
                        Sign in
                      </Link>
                    </>
                  )}
                </p>
              )}

              <button
                type="button"
                disabled={loading || !slug || !selected}
                onClick={() => setReview(true)}
                className="flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black disabled:opacity-50"
              >
                Review promotion
              </button>

              {review && (
                <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-omniv-gold/30">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-omniv-gold">Review</p>
                  <p className="mt-2 text-[14px] text-white">{targetType} · {audience} · {location}</p>
                  <p className="mt-1 text-[13px] text-zinc-400">{duration} days · ${budgetAmount()} total</p>
                  <button type="button" disabled={loading} onClick={() => void onContinue()} className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black disabled:opacity-50">{loading ? "Opening checkout…" : "Continue to payment"}</button>
                </div>
              )}

              <p className="text-center text-[12px] text-zinc-600">
                Secure card payment via Flutterwave. Requires FLW_SECRET_KEY in
                Vercel.
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
