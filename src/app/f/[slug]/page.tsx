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

  // Capture
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [wouldAttend, setWouldAttend] = useState(true);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tip
  const [tipOpen, setTipOpen] = useState(false);
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
        if (amounts?.[0]) setAmount(String(amounts[0] === 3 ? 5 : amounts[1] || 5));
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
          wouldAttend: page.showWouldAttend !== false ? wouldAttend : undefined,
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
    Boolean(page.track?.youtubeUrl);
  const amounts = page.tipAmounts || [3, 5, 10, 20];
  const tipOn = page.tipEnabled !== false;

  return (
    <div className="relative min-h-dvh bg-omniv-black text-omniv-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.09),_transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-lg px-4 pb-16 pt-10 sm:px-6">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <ArtistAvatar
              name={artistName === "..." ? "Artist" : artistName}
              src={avatarUrl}
              size={80}
            />
          </div>
          <p className="font-data text-[10px] uppercase tracking-[0.18em] text-omniv-gold">
            Omniv
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {artistName === "..." ? "Artist" : artistName}
          </h1>
          {page.messageTop?.trim() && (
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-omniv-text-secondary">
              {page.messageTop.trim()}
            </p>
          )}
          {!page.messageTop?.trim() && loaded && (
            <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-omniv-text-secondary">
              New music, shows near you, and a direct line — not another algorithm feed.
            </p>
          )}
        </header>

        {/* Track / release */}
        {hasTrack && (
          <section className="mb-6 overflow-hidden rounded-2xl border border-omniv-border bg-omniv-card">
            {(page.track?.title || page.track?.subtitle) && (
              <div className="border-b border-omniv-border px-4 py-3">
                {page.track?.title && (
                  <h2 className="text-base font-semibold tracking-tight">
                    {page.track.title}
                  </h2>
                )}
                {page.track?.subtitle && (
                  <p className="mt-0.5 text-[12px] text-omniv-text-muted">
                    {page.track.subtitle}
                  </p>
                )}
              </div>
            )}
            {embed && (
              <div className="bg-black/40 p-2 sm:p-3">
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
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-omniv-border bg-omniv-elevated px-3 text-[13px] font-medium hover:border-omniv-gold/40"
                >
                  Stream on Spotify
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {page.track?.appleUrl && (
                <a
                  href={page.track.appleUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-omniv-border bg-omniv-elevated px-3 text-[13px] font-medium hover:border-omniv-gold/40"
                >
                  Apple Music
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {page.track?.youtubeUrl && (
                <a
                  href={page.track.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-omniv-border bg-omniv-elevated px-3 text-[13px] font-medium hover:border-omniv-gold/40"
                >
                  YouTube
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {page.track?.downloadUrl && (
                <a
                  href={page.track.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-omniv-gold px-3 text-[13px] font-semibold text-omniv-black"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              )}
            </div>
          </section>
        )}

        {/* Middle message */}
        {page.messageMiddle?.trim() && (
          <p className="mb-6 rounded-2xl border border-omniv-border/80 bg-omniv-elevated/40 px-4 py-3 text-[13px] leading-relaxed text-omniv-text-secondary">
            {page.messageMiddle.trim()}
          </p>
        )}

        {/* Capture */}
        <section className="mb-6 rounded-2xl border border-omniv-border bg-omniv-card p-4 sm:p-5">
          <h3 className="text-sm font-semibold tracking-tight">
            {page.captureHeadline || "Get the next drop + shows near you"}
          </h3>
          <p className="mt-1 text-[12px] text-omniv-text-muted">
            Email + city only. No spam — early access and invites near you.
          </p>

          {done ? (
            <div className="mt-4 space-y-2 py-2 text-center">
              <CheckCircle2 className="mx-auto h-7 w-7 text-omniv-gold" />
              <p className="text-sm font-medium">You're on the list</p>
              <p className="text-[13px] text-omniv-text-secondary">
                {page.captureReward ||
                  "Thanks — you'll hear about new music and events near you."}
              </p>
              {tipOn && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 h-10 gap-1.5 rounded-xl"
                  onClick={() => setTipOpen(true)}
                >
                  <Heart className="h-3.5 w-3.5 text-omniv-gold" />
                  Support the next one
                </Button>
              )}
            </div>
          ) : (
            <form className="mt-4 space-y-3" onSubmit={(e) => void submitCapture(e)}>
              <Input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl"
              />
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-omniv-text-muted" />
                <Input
                  placeholder="City (where you are)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-11 rounded-xl pl-9"
                />
              </div>
              {page.showWouldAttend !== false && (
                <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-omniv-border bg-omniv-elevated/50 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={wouldAttend}
                    onChange={(e) => setWouldAttend(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-xs leading-relaxed text-omniv-text-secondary">
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
                <span className="text-[11px] leading-relaxed text-omniv-text-muted">
                  I agree to get updates about music and events near me.
                </span>
              </label>
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <Button
                type="submit"
                disabled={busy || !email.trim() || !consent}
                className="h-11 w-full rounded-xl font-semibold"
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

        {/* Links (Linktree layer) */}
        {(page.links || []).length > 0 && (
          <section className="mb-6 space-y-2">
            <p className="px-1 text-[10px] font-medium uppercase tracking-wider text-omniv-text-muted">
              Links
            </p>
            {(page.links || []).map((l) => (
              <a
                key={l.url + l.label}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center justify-between rounded-xl border border-omniv-border bg-omniv-card px-4 text-[14px] font-medium transition-colors hover:border-omniv-gold/40"
              >
                <span>{l.label}</span>
                <ExternalLink className="h-3.5 w-3.5 text-omniv-text-muted" />
              </a>
            ))}
          </section>
        )}

        {/* Tip */}
        {tipOn && (
          <section className="mb-6 rounded-2xl border border-omniv-gold/25 bg-omniv-gold/5 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  <Heart className="h-4 w-4 text-omniv-gold" />
                  Support {artistName === "..." ? "the artist" : artistName}
                </h3>
                <p className="mt-1 text-[12px] text-omniv-text-secondary">
                  Optional. Every tip goes to the next song and the next room.
                </p>
              </div>
            </div>
            {tipMsg && (
              <p className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-300">
                {tipMsg}
              </p>
            )}
            {!tipMsg && (tipOpen || true) && (
              <form className="mt-4 space-y-3" onSubmit={(e) => void payTip(e)}>
                <div className="flex gap-2">
                  {amounts.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAmount(String(a))}
                      className={`h-10 flex-1 rounded-xl border text-[13px] font-medium ${
                        amount === String(a)
                          ? "border-omniv-gold bg-omniv-gold/15 text-omniv-gold"
                          : "border-omniv-border text-omniv-text-muted"
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
                  className="h-10 rounded-xl"
                />
                <Input
                  type="email"
                  required
                  placeholder="Email for receipt"
                  value={tipEmail || email}
                  onChange={(e) => setTipEmail(e.target.value)}
                  className="h-10 rounded-xl"
                />
                {tipErr && <p className="text-xs text-rose-400">{tipErr}</p>}
                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl font-semibold"
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

        {/* Bottom message */}
        {page.messageBottom?.trim() && (
          <p className="mb-8 text-center text-[13px] leading-relaxed text-omniv-text-secondary">
            {page.messageBottom.trim()}
          </p>
        )}

        <p className="text-center text-[10px] text-omniv-text-muted">
          Powered by{" "}
          <Link href="/" className="text-omniv-gold hover:underline">
            Omniv
          </Link>
          {" · "}
          <Link href={`/tip/${slug}`} className="hover:underline">
            Tip only
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
        <div className="flex min-h-dvh items-center justify-center bg-omniv-black text-sm text-omniv-text-muted">
          Loading…
        </div>
      }
    >
      <ReleasePageInner />
    </Suspense>
  );
}
