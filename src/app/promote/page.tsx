"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { CurrentIdentityBanner } from "@/components/discovery/current-identity";
import { startFlutterwaveCheckout } from "@/lib/checkout";
import { type PromotionTargetType } from "@/lib/discovery/monetization";
import {
  readActiveAccount,
  onAccountSwitch,
  type ActiveAccount,
} from "@/lib/discovery/active-account";

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
  { id: "entity", label: "Identity" },
  { id: "product", label: "Product" },
  { id: "event", label: "Event" },
  { id: "opportunity", label: "Opportunity" },
];

const AUDIENCES = [
  "AI & Research",
  "Technology",
  "Business",
  "Founders",
  "Investors",
  "Creators",
  "Music",
  "Culture",
  "Media",
  "Policy",
  "Design",
  "Students",
];

/** Regions & major markets — global discovery */
const REGIONS: { id: string; label: string; group: string }[] = [
  { id: "global", label: "Worldwide", group: "Global" },
  { id: "africa", label: "Africa (all)", group: "Africa" },
  { id: "nigeria", label: "Nigeria", group: "Africa" },
  { id: "ghana", label: "Ghana", group: "Africa" },
  { id: "kenya", label: "Kenya", group: "Africa" },
  { id: "south-africa", label: "South Africa", group: "Africa" },
  { id: "egypt", label: "Egypt", group: "Africa" },
  { id: "europe", label: "Europe (all)", group: "Europe" },
  { id: "uk", label: "United Kingdom", group: "Europe" },
  { id: "germany", label: "Germany", group: "Europe" },
  { id: "france", label: "France", group: "Europe" },
  { id: "north-america", label: "North America", group: "Americas" },
  { id: "usa", label: "United States", group: "Americas" },
  { id: "canada", label: "Canada", group: "Americas" },
  { id: "brazil", label: "Brazil", group: "Americas" },
  { id: "asia", label: "Asia (all)", group: "Asia & Pacific" },
  { id: "india", label: "India", group: "Asia & Pacific" },
  { id: "uae", label: "United Arab Emirates", group: "Asia & Pacific" },
  { id: "singapore", label: "Singapore", group: "Asia & Pacific" },
  { id: "australia", label: "Australia", group: "Asia & Pacific" },
];

/** Duration packages with aligned pricing (USD) */
const PACKAGES = [
  { days: 1, price: 12, label: "1 day", reach: "~2–4k impressions" },
  { days: 3, price: 29, label: "3 days", reach: "~8–15k impressions" },
  { days: 7, price: 59, label: "7 days", reach: "~25–40k impressions" },
  { days: 14, price: 99, label: "14 days", reach: "~50–80k impressions" },
  { days: 30, price: 179, label: "30 days", reach: "~120–200k impressions" },
] as const;

function PromoteInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const preSlug = sp.get("slug") || "";
  const billingOk = sp.get("billing") === "success";

  const [pubs, setPubs] = useState<Pub[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [slug, setSlug] = useState(preSlug);
  const [targetType, setTargetType] =
    useState<PromotionTargetType>("publication");
  const [audiences, setAudiences] = useState<string[]>(["AI & Research"]);
  const [region, setRegion] = useState("global");
  const [packageDays, setPackageDays] = useState(7);
  const [auth, setAuth] = useState<boolean | null>(null);
  const [done, setDone] = useState(billingOk);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState(false);
  const [identity, setIdentity] = useState<ActiveAccount | null>(null);

  const pkg = PACKAGES.find((p) => p.days === packageDays) ?? PACKAGES[2];
  const regionLabel =
    REGIONS.find((r) => r.id === region)?.label ?? "Worldwide";

  useEffect(() => {
    setIdentity(readActiveAccount());
    return onAccountSwitch((a) => setIdentity(a));
  }, []);

  useEffect(() => {
    if (billingOk) setDone(true);
  }, [billingOk]);

  useEffect(() => {
    (async () => {
      try {
        const [pubRes, entityRes] = await Promise.all([
          fetch("/api/discovery/publications/list?owner=me&limit=30"),
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

  const candidates = useMemo(() => {
    if (targetType === "entity") {
      return entities.map((entity) => ({
        id: entity.id,
        title: entity.name,
        slug: entity.slug,
        type: entity.type,
      }));
    }
    if (targetType === "publication") return pubs;
    return pubs.filter((p) => p.type === targetType);
  }, [targetType, pubs, entities]);

  const selected = candidates.find((item) => item.slug === slug);

  useEffect(() => {
    if (
      candidates.length > 0 &&
      !candidates.some((item) => item.slug === slug)
    ) {
      setSlug(candidates[0]!.slug);
    }
  }, [candidates, slug]);

  function toggleAudience(a: string) {
    setAudiences((prev) => {
      if (prev.includes(a)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== a);
      }
      if (prev.length >= 4) return prev;
      return [...prev, a];
    });
  }

  async function onContinue() {
    setError(null);
    setLoading(true);
    const amount = pkg.price;

    try {
      localStorage.setItem(
        "omniv_promote_draft",
        JSON.stringify({
          slug,
          title: selected?.title,
          audiences,
          region,
          duration: pkg.days,
          budget: amount,
          identity: identity?.name || "personal",
          at: Date.now(),
        })
      );
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
        durationDays: pkg.days,
        budget: amount,
        audience: audiences,
        location: regionLabel,
        entityId: identity?.id || null,
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
        promotion_id: draftData.promotion?.id,
        target_type: targetType,
        slug,
        region,
        duration: String(pkg.days),
        entity_id: identity?.id,
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
              aria-label="Back"
            >
              ←
            </button>
            <span className="text-[16px] font-semibold text-white">
              Promote
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-2 md:max-w-2xl">
          <div className="mb-5">
            <CurrentIdentityBanner action="Campaign runs as" />
          </div>

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
            <div className="mt-6 rounded-2xl bg-emerald-500/10 p-6 text-center ring-1 ring-emerald-500/25">
              <p className="text-[16px] font-semibold text-emerald-300">
                {billingOk ? "Checkout returned" : "Promotion ready"}
              </p>
              <p className="mt-2 text-[13px] text-zinc-400">
                {billingOk
                  ? "Waiting for payment confirmation. The campaign activates only after Flutterwave verifies the charge."
                  : `Targeted discovery for “${selected?.title || slug}”.`}
              </p>
              <Link
                href={identity?.path || "/home"}
                className="mt-5 inline-flex h-11 items-center rounded-full bg-omniv-gold px-5 text-[14px] font-semibold text-black"
              >
                Back
              </Link>
            </div>
          )}

          {auth && !done && (
            <div className="space-y-7">
              <p className="text-[14px] leading-relaxed text-zinc-500">
                Reach the right people for this identity — not more noise.
                Pricing is fixed by campaign length.
              </p>

              <Field label="What do you want to promote?">
                <div className="flex flex-wrap gap-2">
                  {TARGETS.map((t) => (
                    <Chip
                      key={t.id}
                      active={targetType === t.id}
                      onClick={() => setTargetType(t.id)}
                    >
                      {t.label}
                    </Chip>
                  ))}
                </div>
              </Field>

              {selected && (
                <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-omniv-gold/15 text-omniv-gold">
                    ▣
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-white">
                      {selected.title}
                    </p>
                    <p className="text-[12px] capitalize text-zinc-500">
                      {targetType}
                    </p>
                  </div>
                </div>
              )}

              {candidates.length > 1 && (
                <label className="block">
                  <span className="text-[12px] text-zinc-500">Select</span>
                  <select
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="mt-1.5 h-12 w-full rounded-xl bg-white/[0.04] px-3 text-[14px] text-white outline-none ring-1 ring-white/[0.08]"
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
                  Nothing to promote under this identity yet.{" "}
                  <Link href="/publish" className="text-omniv-gold">
                    Publish →
                  </Link>
                </p>
              )}

              <Field label="Who should discover this? (up to 4)">
                <div className="flex flex-wrap gap-2">
                  {AUDIENCES.map((a) => (
                    <Chip
                      key={a}
                      active={audiences.includes(a)}
                      onClick={() => toggleAudience(a)}
                    >
                      {a}
                    </Chip>
                  ))}
                </div>
              </Field>

              <Field label="Where?">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="h-12 w-full rounded-xl bg-white/[0.04] px-3 text-[14px] text-white outline-none ring-1 ring-white/[0.08]"
                >
                  {["Global", "Africa", "Europe", "Americas", "Asia & Pacific"].map(
                    (group) => (
                      <optgroup key={group} label={group} className="bg-zinc-900">
                        {REGIONS.filter((r) => r.group === group).map((r) => (
                          <option key={r.id} value={r.id} className="bg-zinc-900">
                            {r.label}
                          </option>
                        ))}
                      </optgroup>
                    )
                  )}
                </select>
              </Field>

              <Field label="Campaign length">
                <select
                  value={packageDays}
                  onChange={(e) => setPackageDays(Number(e.target.value))}
                  className="h-12 w-full rounded-xl bg-white/[0.04] px-3 text-[14px] text-white outline-none ring-1 ring-white/[0.08]"
                >
                  {PACKAGES.map((p) => (
                    <option
                      key={p.days}
                      value={p.days}
                      className="bg-zinc-900"
                    >
                      {p.label} — ${p.price}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Price card tied to duration */}
              <div className="rounded-2xl bg-omniv-gold/10 p-5 ring-1 ring-omniv-gold/30">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
                      Campaign total
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-white">
                      ${pkg.price}
                    </p>
                    <p className="mt-1 text-[13px] text-zinc-400">
                      {pkg.label} · {regionLabel}
                    </p>
                  </div>
                  <p className="text-right text-[12px] text-zinc-500">
                    {pkg.reach}
                  </p>
                </div>
                <p className="mt-3 text-[12px] leading-relaxed text-zinc-500">
                  One-time charge. Runs under{" "}
                  <span className="text-zinc-300">
                    {identity?.name || "Personal"}
                  </span>
                  . Impressions are estimates, not guarantees.
                </p>
              </div>

              {error && (
                <p className="text-center text-[13px] text-rose-400">{error}</p>
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
                <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/[0.1]">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-omniv-gold">
                    Review
                  </p>
                  <ul className="mt-3 space-y-1.5 text-[13px] text-zinc-300">
                    <li>
                      <span className="text-zinc-500">Target · </span>
                      {selected?.title}
                    </li>
                    <li>
                      <span className="text-zinc-500">Audience · </span>
                      {audiences.join(", ")}
                    </li>
                    <li>
                      <span className="text-zinc-500">Region · </span>
                      {regionLabel}
                    </li>
                    <li>
                      <span className="text-zinc-500">Length · </span>
                      {pkg.label}
                    </li>
                    <li>
                      <span className="text-zinc-500">Total · </span>${pkg.price}
                    </li>
                  </ul>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void onContinue()}
                    className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black disabled:opacity-50"
                  >
                    {loading ? "Opening checkout…" : "Continue to payment"}
                  </button>
                </div>
              )}

              <p className="text-center text-[11px] text-zinc-600">
                Secure card payment via Flutterwave.
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
      <p className="mb-2.5 text-[12px] font-medium text-zinc-400">{label}</p>
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
      className={`rounded-full px-3.5 py-2 text-[13px] font-medium transition ${
        active
          ? "bg-omniv-gold text-black"
          : "text-zinc-400 ring-1 ring-white/12 hover:text-white"
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
