"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  ExternalLink,
  Download,
  Heart,
} from "lucide-react";
import { ArtistAvatar } from "@/components/public/artist-avatar";
import {
  mergePublicPage,
  spotifyEmbedUrl,
  type ArtistPublicPage,
} from "@/lib/artist-public-page";

function ReleasePageInner() {
  const params = useParams();
  const search = useSearchParams();
  const slug = String(params.slug || "").toLowerCase();
  const source = search.get("source") || "bio_link";
  const paid = search.get("paid") === "1";

  const [artistName, setArtistName] = useState("...");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [page, setPage] = useState<ArtistPublicPage>(mergePublicPage({}));
  const [loaded, setLoaded] = useState(false);

  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [wouldAttend, setWouldAttend] = useState(true);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tipName, setTipName] = useState("");
  const [tipEmail, setTipEmail] = useState("");
  const [amount, setAmount] = useState("5");
  const [tipBusy, setTipBusy] = useState(false);
  const [tipErr, setTipErr] = useState<string | null>(null);
  const [tipMsg, setTipMsg] = useState(
    paid ? "Thank you — your support means a lot." : null
  );

  useEffect(() => {
    if (slug) track("fan_gate_view", { slug, source }, `/f/${slug}`);
  }, [slug, source]);

  useEffect(() => {
    if (!loaded) return;
    if (typeof window === "undefined") return;
    if (window.location.hash === "#tip") {
      document.getElementById("tip")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [loaded]);

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      try {
        const res = await fetch(
          `/api/roster/public?slug=${encodeURIComponent(slug)}`
        );
        if (!res.ok) {
          setLoaded(true);
          return;
        }
        const data = (await res.json()) as {
          stageName?: string;
          avatarUrl?: string | null;
          page?: ArtistPublicPage;
        };
        if (data.stageName) setArtistName(data.stageName);
        if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
        if (data.page) setPage(mergePublicPage(data.page));
        const amounts = data.page?.tipAmounts;
        if (amounts?.[0])
          setAmount(String(amounts[0] === 3 ? 5 : amounts[1] || 5));
      } catch {
        /* soft */
      }
      setLoaded(true);
    })();
  }, [slug]);

  async function submitCapture(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !consent) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/fans/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistSlug: slug,
          email: email.trim(),
          city: city.trim() || undefined,
          wouldAttend:
            page.showWouldAttend !== false ? wouldAttend : undefined,
          consent: true,
          source,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        artist?: string;
      };
      if (!res.ok) {
        setError(data.error || "Could not save — try again");
        setBusy(false);
        return;
      }
      if (data.artist) setArtistName(data.artist);
      setDone(true);
      track("fan_captured_page", { slug }, `/f/${slug}`);
    } catch {
      setError("Network error — try again");
    }
    setBusy(false);
  }

  async function payTip(e: React.FormEvent) {
    e.preventDefault();
    setTipBusy(true);
    setTipErr(null);
    try {
      const res = await fetch("/api/tips/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          email: tipEmail.trim() || email.trim(),
          name: tipName.trim() || undefined,
          amountUsd: Number(amount),
        }),
      });
      const data = (await res.json()) as { link?: string; error?: string };
      if (!res.ok || !data.link) {
        setTipErr(data.error || "Checkout failed");
        setTipBusy(false);
        return;
      }
      window.location.href = data.link;
    } catch {
      setTipErr("Network error");
      setTipBusy(false);
    }
  }

  const embed = spotifyEmbedUrl(page.track?.spotifyUrl);
  const hasTrack =
    Boolean(page.track?.title) ||
    Boolean(embed) ||
    Boolean(page.track?.downloadUrl) ||
    Boolean(page.track?.youtubeUrl) ||
    Boolean(page.track?.appleUrl);
  const amounts = page.tipAmounts || [3, 5, 10, 20];
  const tipOn = page.tipEnabled !== false;
  const displayName = artistName === "..." ? "Artist" : artistName;

  if (!loaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0a] text-sm text-white/40">
        Loading…
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh bg-[#0a0a0a] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.12),_transparent_55%)]" />

      <div className="relative z-10 mx-auto max-w-md px-4 pb-20 pt-12 sm:px-5">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-5 flex justify-center">
            <div className="rounded-2xl ring-1 ring-white/10 shadow-[0_0_40px_rgba(212,175,55,0.15)]">
              <ArtistAvatar
                name={displayName}
                src={avatarUrl}
                slug={slug}
                size={88}
              />
            </div>
          </div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#d4af37]">
            Omniv
          </p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-tight sm:text-[32px]">
            {displayName}
          </h1>
          {(page.messageTop?.trim() || loaded) && (
            <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-white/65">
              {page.messageTop?.trim() ||
                "New music, shows near you, and a direct line — not another algorithm feed."}
            </p>
          )}
        </header>

        {hasTrack && (
          <section className="mb-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            {(page.track?.title || page.track?.subtitle) && (
              <div className="border-b border-white/10 px-4 py-3.5">
                {page.track?.title && (
                  <h2 className="text-[16px] font-semibold tracking-tight">
                    {page.track.title}
                  </h2>
                )}
                {page.track?.subtitle && (
                  <p className="mt-0.5 text-[12px] text-white/45">
                    {page.track.subtitle}
                  </p>
                )}
              </div>
            )}
            {embed && (
              <div className="bg-black/50 p-2">
                <iframe
                  title="Spotify"
                  src={embed}
                  width="100%"
                  height="152"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-xl"
                />
              </div>
            )}
            <div className="flex flex-wrap gap-2 p-3">
              {page.track?.spotifyUrl && !embed && (
                <a
                  href={page.track.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-[13px] font-medium hover:border-[#d4af37]/40"
                >
                  Stream on Spotify
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </a>
              )}
              {page.track?.appleUrl && (
                <a
                  href={page.track.appleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-[13px] font-medium"
                >
                  Apple Music
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </a>
              )}
              {page.track?.downloadUrl && (
                <a
                  href={page.track.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#d4af37] px-3 text-[13px] font-semibold text-black"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              )}
            </div>
          </section>
        )}

        {page.messageMiddle?.trim() && (
          <p className="mb-5 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3.5 text-[14px] leading-relaxed text-white/60">
            {page.messageMiddle.trim()}
          </p>
        )}

        <section className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <h3 className="text-[15px] font-semibold tracking-tight">
            {page.captureHeadline || "Get the next drop + shows near you"}
          </h3>
          <p className="mt-1 text-[12px] text-white/45">
            Email + city. Early access and invites near you — no spam.
          </p>

          {done ? (
            <div className="mt-5 space-y-2 py-2 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-[#d4af37]" />
              <p className="text-[15px] font-medium">You're on the list</p>
              <p className="text-[13px] text-white/55">
                {page.captureReward ||
                  "Thanks — you'll hear about new music and events near you."}
              </p>
            </div>
          ) : (
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => void submitCapture(e)}
            >
              <Input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-white/[0.05]"
              />
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input
                  placeholder="City (where you are)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-12 rounded-xl border-white/10 bg-white/[0.05] pl-10"
                />
              </div>
              {page.showWouldAttend !== false && (
                <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-3">
                  <input
                    type="checkbox"
                    checked={wouldAttend}
                    onChange={(e) => setWouldAttend(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-[12px] leading-relaxed text-white/55">
                    I would come to a small show or listening session near me.
                  </span>
                </label>
              )}
              <label className="flex cursor-pointer items-start gap-2.5 px-1">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5"
                  required
                />
                <span className="text-[11px] leading-relaxed text-white/40">
                  I agree to get updates about music and events near me.
                </span>
              </label>
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <Button
                type="submit"
                disabled={busy || !email.trim() || !consent}
                className="h-12 w-full rounded-xl bg-[#d4af37] text-[14px] font-semibold text-black hover:bg-[#c9a42e]"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Join the list"
                )}
              </Button>
            </form>
          )}
        </section>

        {(page.links || []).length > 0 && (
          <section className="mb-5 space-y-2">
            {(page.links || []).map((l) => (
              <a
                key={l.url + l.label}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 text-[14px] font-medium transition-colors hover:border-[#d4af37]/35"
              >
                <span>{l.label}</span>
                <ExternalLink className="h-3.5 w-3.5 text-white/35" />
              </a>
            ))}
          </section>
        )}

        {tipOn && (
          <section
            id="tip"
            className="mb-6 scroll-mt-6 rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/[0.06] p-4 sm:p-5"
          >
            <h3 className="flex items-center gap-1.5 text-[15px] font-semibold">
              <Heart className="h-4 w-4 text-[#d4af37]" />
              Support {displayName}
            </h3>
            <p className="mt-1 text-[12px] text-white/50">
              Optional. Every tip goes to the next song and the next room.
            </p>
            {tipMsg && (
              <p className="mt-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-300">
                {tipMsg}
              </p>
            )}
            {!tipMsg && (
              <form className="mt-4 space-y-3" onSubmit={(e) => void payTip(e)}>
                <div className="flex gap-2">
                  {amounts.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAmount(String(a))}
                      className={`h-11 flex-1 rounded-xl border text-[13px] font-medium ${
                        amount === String(a)
                          ? "border-[#d4af37] bg-[#d4af37]/15 text-[#d4af37]"
                          : "border-white/10 text-white/45"
                      }`}
                    >
                      ${a}
                    </button>
                  ))}
                </div>
                <Input
                  placeholder="Your name (optional)"
                  value={tipName}
                  onChange={(e) => setTipName(e.target.value)}
                  className="h-11 rounded-xl border-white/10 bg-white/[0.05]"
                />
                <Input
                  type="email"
                  required
                  placeholder="Email for receipt"
                  value={tipEmail || email}
                  onChange={(e) => setTipEmail(e.target.value)}
                  className="h-11 rounded-xl border-white/10 bg-white/[0.05]"
                />
                {tipErr && <p className="text-xs text-rose-400">{tipErr}</p>}
                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-[#d4af37] text-[14px] font-semibold text-black"
                  disabled={tipBusy || !slug}
                >
                  {tipBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `Tip $${amount || "…"}`
                  )}
                </Button>
              </form>
            )}
          </section>
        )}

        {page.messageBottom?.trim() && (
          <p className="mb-8 text-center text-[13px] leading-relaxed text-white/50">
            {page.messageBottom.trim()}
          </p>
        )}

        <p className="text-center text-[10px] text-white/30">
          Powered by{" "}
          <Link href="/" className="text-[#d4af37] hover:underline">
            Omniv
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function FanGatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0a] text-sm text-white/40">
          Loading…
        </div>
      }
    >
      <ReleasePageInner />
    </Suspense>
  );
}
