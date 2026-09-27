"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { readActiveAccount } from "@/lib/discovery/active-account";

type EntityRow = {
  id: string;
  type: string;
  slug: string;
  name: string;
  path: string;
  verified?: boolean;
};

type Req = {
  id: string;
  entity_name: string;
  status: string;
  created_at: string;
  verify_type?: string;
};

type VerifyKind = "personal" | "company" | "artist" | "brand";

type Role =
  | "founder"
  | "co_founder"
  | "ceo"
  | "employee"
  | "manager"
  | "authorized"
  | "other";

const KIND_LABEL: Record<VerifyKind, string> = {
  personal: "Personal profile",
  company: "Company / Organization",
  artist: "Artist / Creator",
  brand: "Brand",
};

const ROLE_LABEL: Record<Role, string> = {
  founder: "Founder",
  co_founder: "Co-founder",
  ceo: "CEO",
  employee: "Employee",
  manager: "Manager",
  authorized: "Authorized representative",
  other: "Other",
};

function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const label =
    s === "approved"
      ? "Approved"
      : s === "rejected"
        ? "Rejected"
        : s === "more_info"
          ? "More info"
          : "Under review";
  const color =
    s === "approved"
      ? "text-emerald-400"
      : s === "rejected"
        ? "text-rose-400"
        : "text-amber-400";
  return <span className={`text-[12px] font-medium ${color}`}>{label}</span>;
}

export default function VerifyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [entities, setEntities] = useState<EntityRow[]>([]);
  const [requests, setRequests] = useState<Req[]>([]);
  const [auth, setAuth] = useState<boolean | null>(null);
  const [kind, setKind] = useState<VerifyKind>("company");
  const [entityId, setEntityId] = useState("");
  const [orgName, setOrgName] = useState("");
  const [website, setWebsite] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [role, setRole] = useState<Role>("founder");
  const [evidence, setEvidence] = useState({
    website: true,
    email: true,
    registration: false,
    social: false,
    other: false,
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [eRes, rRes] = await Promise.all([
          fetch("/api/discovery/entities"),
          fetch("/api/discovery/verify"),
        ]);
        const eData = await eRes.json();
        const rData = await rRes.json();
        if (cancelled) return;
        setAuth(Boolean(eData.auth));
        const list: EntityRow[] = eData.entities || [];
        setEntities(list);
        setRequests(rData.requests || []);
        const active = readActiveAccount();
        if (active?.id && list.some((x) => x.id === active.id)) {
          setEntityId(active.id);
          setOrgName(active.name || "");
          if (active.type === "person") setKind("personal");
          else if (active.type === "artist") setKind("artist");
          else if (active.type === "brand") setKind("brand");
          else setKind("company");
        } else if (list[0]) {
          setEntityId(list[0].id);
          setOrgName(list[0].name);
        }
      } catch {
        if (!cancelled) setAuth(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = entities.find((e) => e.id === entityId);

  async function submitApplication() {
    setLoading(true);
    setError(null);
    try {
      const evidenceNotes = [
        evidence.website && website ? `Website: ${website}` : null,
        evidence.email && orgEmail ? `Email: ${orgEmail}` : null,
        evidence.registration
          ? "Registration document: provided (manual)"
          : null,
        evidence.social ? "Official social: connected (manual)" : null,
        evidence.other ? "Other evidence: noted" : null,
        role ? `Role: ${ROLE_LABEL[role]}` : null,
        notes ? `Notes: ${notes}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const res = await fetch("/api/discovery/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityId: selected?.id || entityId || null,
          entityType: selected?.type || kind,
          entitySlug: selected?.slug || null,
          entityName: orgName || selected?.name || "Unknown",
          verifyType: kind === "personal" ? "individual" : "organization",
          notes: evidenceNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not submit application");
        return;
      }
      setStep(6);
      const rRes = await fetch("/api/discovery/verify");
      const rData = await rRes.json();
      setRequests(rData.requests || []);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (auth === false) {
    return (
      <DiscoveryShell>
        <div className="flex min-h-dvh flex-col items-center justify-center bg-[#050505] px-6 text-center">
          <p className="text-[17px] font-semibold text-white">Sign in to apply</p>
          <p className="mt-2 text-[14px] text-zinc-500">
            Verification is attached to your identities on Omniv.
          </p>
          <Link
            href="/login?next=/verify"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-omniv-gold px-6 text-[14px] font-semibold text-black"
          >
            Sign in
          </Link>
          <BottomNav />
        </div>
      </DiscoveryShell>
    );
  }

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-white/[0.05] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
            <button
              type="button"
              onClick={() =>
                step > 0 && step < 6 ? setStep(step - 1) : router.back()
              }
              className="text-zinc-400"
            >
              ←
            </button>
            <h1 className="text-[17px] font-semibold text-white">Get verified</h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-5">
          {step === 0 && requests.length > 0 && (
            <section className="mb-8">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                Your applications
              </p>
              <ul className="space-y-2">
                {requests.slice(0, 5).map((r) => (
                  <li
                    key={r.id}
                    className="rounded-2xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/[0.06]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-medium text-white">
                        {r.entity_name}
                      </p>
                      <StatusPill status={r.status} />
                    </div>
                    <p className="mt-1 text-[12px] text-zinc-500">
                      {new Date(r.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {step === 0 && (
            <section>
              <p className="text-[22px] font-semibold leading-snug text-white">
                Build trust around your identity and what you publish.
              </p>
              <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">
                Omniv verification confirms authenticity — not endorsement. You
                apply, we review evidence, then the badge appears on the identity
                you choose.
              </p>
              <p className="mt-6 mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
                What are you verifying?
              </p>
              <div className="space-y-2">
                {(Object.keys(KIND_LABEL) as VerifyKind[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={`flex w-full items-start gap-3 rounded-2xl px-4 py-3.5 text-left ring-1 transition ${
                      kind === k
                        ? "bg-omniv-gold/10 ring-omniv-gold/40"
                        : "bg-white/[0.03] ring-white/[0.06]"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        kind === k
                          ? "border-omniv-gold bg-omniv-gold"
                          : "border-zinc-600"
                      }`}
                    >
                      {kind === k && (
                        <span className="h-2 w-2 rounded-full bg-black" />
                      )}
                    </span>
                    <span>
                      <span className="block text-[14px] font-medium text-white">
                        {KIND_LABEL[k]}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-zinc-500">
                        {k === "personal"
                          ? "Verify that you are a real person."
                          : k === "artist"
                            ? "Verify your identity and creative presence."
                            : k === "brand"
                              ? "Verify ownership or representation of the brand."
                              : "Verify your organization and your relationship to it."}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black"
              >
                Continue
              </button>
            </section>
          )}

          {step === 1 && (
            <section>
              <p className="text-[20px] font-semibold text-white">
                {kind === "personal"
                  ? "Verify your profile"
                  : "Verify your organization"}
              </p>
              {entities.length > 0 && (
                <label className="mt-5 block">
                  <span className="text-[12px] text-zinc-500">Identity on Omniv</span>
                  <select
                    value={entityId}
                    onChange={(e) => {
                      setEntityId(e.target.value);
                      const ent = entities.find((x) => x.id === e.target.value);
                      if (ent) setOrgName(ent.name);
                    }}
                    className="mt-1.5 h-12 w-full rounded-xl bg-white/[0.04] px-3.5 text-[15px] text-white outline-none ring-1 ring-white/[0.08]"
                  >
                    {entities.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.type})
                        {e.verified ? " ✓" : ""}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className="mt-4 block">
                <span className="text-[12px] text-zinc-500">
                  {kind === "personal" ? "Full name" : "Organization name"}
                </span>
                <input
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="mt-1.5 h-12 w-full rounded-xl bg-white/[0.04] px-3.5 text-[15px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/30"
                  placeholder={kind === "personal" ? "Your name" : "Nokanda AI"}
                />
              </label>
              {kind !== "personal" && (
                <>
                  <label className="mt-4 block">
                    <span className="text-[12px] text-zinc-500">Website</span>
                    <input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="mt-1.5 h-12 w-full rounded-xl bg-white/[0.04] px-3.5 text-[15px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/30"
                      placeholder="https://example.com"
                    />
                  </label>
                  <label className="mt-4 block">
                    <span className="text-[12px] text-zinc-500">
                      Organization email
                    </span>
                    <input
                      type="email"
                      value={orgEmail}
                      onChange={(e) => setOrgEmail(e.target.value)}
                      className="mt-1.5 h-12 w-full rounded-xl bg-white/[0.04] px-3.5 text-[15px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/30"
                      placeholder="you@company.com"
                    />
                  </label>
                </>
              )}
              <button
                type="button"
                disabled={!orgName.trim()}
                onClick={() => setStep(2)}
                className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black disabled:opacity-40"
              >
                Continue
              </button>
            </section>
          )}

          {step === 2 && (
            <section>
              <p className="text-[20px] font-semibold text-white">
                Tell us about your relationship
              </p>
              <p className="mt-2 text-[13px] text-zinc-500">
                How are you connected to {orgName || "this identity"}?
              </p>
              <div className="mt-5 space-y-2">
                {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ring-1 ${
                      role === r
                        ? "bg-omniv-gold/10 ring-omniv-gold/40"
                        : "bg-white/[0.03] ring-white/[0.06]"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        role === r
                          ? "border-omniv-gold bg-omniv-gold"
                          : "border-zinc-600"
                      }`}
                    />
                    <span className="text-[14px] text-white">{ROLE_LABEL[r]}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black"
              >
                Continue
              </button>
            </section>
          )}

          {step === 3 && (
            <section>
              <p className="text-[20px] font-semibold text-white">Confirm with evidence</p>
              <p className="mt-2 text-[13px] text-zinc-500">
                Provide at least 2 forms of evidence. Used for authenticity only —
                not shown publicly.
              </p>
              <ul className="mt-5 space-y-2">
                {(
                  [
                    {
                      key: "website" as const,
                      label: "Website",
                      detail: website || "Add on previous step",
                    },
                    {
                      key: "email" as const,
                      label: "Business email",
                      detail: orgEmail || "Add on previous step",
                    },
                    {
                      key: "registration" as const,
                      label: "Business registration",
                      detail: "Upload in review (manual)",
                    },
                    {
                      key: "social" as const,
                      label: "Official social account",
                      detail: "Connect during review",
                    },
                    {
                      key: "other" as const,
                      label: "Other supporting evidence",
                      detail: "Describe in notes",
                    },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setEvidence((e) => ({ ...e, [item.key]: !e[item.key] }))
                    }
                    className={`flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left ring-1 ${
                      evidence[item.key]
                        ? "bg-omniv-gold/10 ring-omniv-gold/40"
                        : "bg-white/[0.03] ring-white/[0.06]"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] ${
                        evidence[item.key]
                          ? "border-omniv-gold bg-omniv-gold text-black"
                          : "border-zinc-600"
                      }`}
                    >
                      {evidence[item.key] ? "✓" : ""}
                    </span>
                    <span>
                      <span className="block text-[14px] font-medium text-white">
                        {item.label}
                      </span>
                      <span className="text-[12px] text-zinc-500">{item.detail}</span>
                    </span>
                  </button>
                ))}
              </ul>
              <label className="mt-4 block">
                <span className="text-[12px] text-zinc-500">Additional notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-xl bg-white/[0.04] px-3.5 py-3 text-[14px] text-white outline-none ring-1 ring-white/[0.08]"
                  placeholder="Anything that helps us confirm authenticity…"
                />
              </label>
              <button
                type="button"
                disabled={Object.values(evidence).filter(Boolean).length < 2}
                onClick={() => setStep(4)}
                className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black disabled:opacity-40"
              >
                Continue
              </button>
            </section>
          )}

          {step === 4 && (
            <section>
              <p className="text-[20px] font-semibold text-white">Verify your identity</p>
              <p className="mt-3 text-[14px] leading-relaxed text-zinc-400">
                We need to confirm that you're a real person and that you're
                authorized to represent this entity.
              </p>
              <div className="mt-6 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
                <p className="text-[14px] font-medium text-white">Manual review (MVP)</p>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
                  For launch, identity checks are handled by the Omniv review team.
                  A third-party provider can plug in here later.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="mt-8 flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black"
              >
                Continue to fee
              </button>
            </section>
          )}

          {step === 5 && (
            <section>
              <p className="text-[20px] font-semibold text-white">Omniv Verification</p>
              <p className="mt-2 text-[14px] text-zinc-400">
                Application fee — review is not automatic.
              </p>
              <div className="mt-6 overflow-hidden rounded-2xl ring-1 ring-omniv-gold/30">
                <div className="bg-omniv-gold/10 px-5 py-5">
                  <p className="text-[13px] font-medium text-omniv-gold">
                    One-time application
                  </p>
                  <p className="mt-1 text-[32px] font-semibold tracking-tight text-white">
                    $19
                  </p>
                  <ul className="mt-4 space-y-2 text-[13px] text-zinc-300">
                    {[
                      "Identity / entity review",
                      "Verification badge if approved",
                      "Verified publisher status",
                      "Badge on publications",
                      "Priority review (1–3 business days)",
                      "Free resubmission if more evidence is needed",
                    ].map((line) => (
                      <li key={line} className="flex gap-2">
                        <span className="text-omniv-gold">✓</span>
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-[12px] leading-relaxed text-zinc-600">
                Payment enters the review queue. It does not guarantee a badge.
              </p>
              {error && <p className="mt-3 text-[13px] text-rose-400">{error}</p>}
              <button
                type="button"
                disabled={loading}
                onClick={submitApplication}
                className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[14px] font-semibold text-black disabled:opacity-50"
              >
                {loading ? "Submitting…" : "Apply for verification — $19"}
              </button>
            </section>
          )}

          {step === 6 && (
            <section className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-omniv-gold/15 text-2xl text-omniv-gold">
                ✓
              </div>
              <p className="mt-5 text-[22px] font-semibold text-white">
                Verification submitted
              </p>
              <p className="mt-2 text-[14px] text-zinc-400">
                We're reviewing your application.
              </p>
              <div className="mt-6 rounded-2xl bg-white/[0.03] px-4 py-4 text-left ring-1 ring-white/[0.06]">
                <div className="flex justify-between text-[13px]">
                  <span className="text-zinc-500">Application</span>
                  <span className="font-medium text-white">{orgName}</span>
                </div>
                <div className="mt-2 flex justify-between text-[13px]">
                  <span className="text-zinc-500">Type</span>
                  <span className="text-white">{KIND_LABEL[kind]}</span>
                </div>
                <div className="mt-2 flex justify-between text-[13px]">
                  <span className="text-zinc-500">Status</span>
                  <StatusPill status="pending" />
                </div>
              </div>
              <div className="mt-6 space-y-2 text-left text-[13px] text-zinc-400">
                <p className="font-medium text-zinc-300">What happens next</p>
                <p>1. Evidence received ✓</p>
                <p>2. Identity checked ◐</p>
                <p>3. Entity reviewed ○</p>
                <p>4. Decision ○</p>
                <p className="pt-2 text-[12px] text-zinc-600">
                  Most applications are reviewed within 1–3 business days.
                </p>
              </div>
              <Link
                href="/accounts"
                className="mt-8 inline-flex h-11 items-center rounded-full bg-white/[0.06] px-6 text-[14px] font-medium text-white"
              >
                Back to accounts
              </Link>
            </section>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
