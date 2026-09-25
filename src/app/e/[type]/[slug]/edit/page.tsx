"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";
import { CoverUpload } from "@/components/discovery/cover-upload";

type Entity = {
  id: string;
  type: string;
  slug: string;
  name: string;
  tagline?: string;
  location?: string;
  about?: string;
  path: string;
  avatar_url?: string | null;
  cover_url?: string | null;
};

export default function EditEntityPage() {
  const params = useParams();
  const router = useRouter();
  const type = String(params.type || "");
  const slug = String(params.slug || "");

  const [entity, setEntity] = useState<Entity | null>(null);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [website, setWebsite] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/discovery/entities");
        const data = await res.json();
        const list: Entity[] = data.entities || [];
        const found = list.find((e) => e.type === type && e.slug === slug);
        if (!found) {
          setError("Entity not found or you don't own it");
          return;
        }
        setEntity(found);
        setName(found.name);
        setTagline(found.tagline || "");
        setLocation(found.location || "");
        setAbout(found.about || "");
        setCoverUrl(found.cover_url || null);
        setAvatarUrl(found.avatar_url || null);
      } catch {
        setError("Could not load entity");
      }
    })();
  }, [type, slug]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!entity) return;
    setLoading(true);
    setError(null);
    setOk(false);
    try {
      const res = await fetch(`/api/discovery/entities/${entity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tagline,
          location,
          about,
          website,
          cover_url: coverUrl,
          avatar_url: avatarUrl,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(`/signup?next=/e/${type}/${slug}/edit`);
        return;
      }
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      setOk(true);
      if (data.path) {
        setTimeout(() => router.push(data.path), 600);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-[#050505] text-zinc-100">
        <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3 md:max-w-2xl">
            <Link
              href={entity?.path || `/e/${type}/${slug}`}
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400"
            >
              ←
            </Link>
            <h1 className="text-[16px] font-semibold text-white">
              Edit entity
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-4 pb-28 pt-4 md:max-w-2xl">
          {error && !entity && (
            <p className="text-center text-[14px] text-red-400">{error}</p>
          )}

          {entity && (
            <form onSubmit={onSave} className="space-y-5">
              <CoverUpload
                label="Change cover"
                value={coverUrl}
                onChange={setCoverUrl}
              />

              <div>
                <p className="mb-1.5 text-[12px] text-zinc-400">Avatar</p>
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-omniv-gold/20 text-2xl font-semibold text-omniv-gold ring-2 ring-white/10">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      name.charAt(0) || "?"
                    )}
                  </div>
                  <CoverUpload
                    label="Upload photo"
                    tall
                    value={avatarUrl}
                    onChange={setAvatarUrl}
                  />
                </div>
              </div>

              <label className="block">
                <span className="text-[12px] text-zinc-400">Name *</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
                />
              </label>
              <label className="block">
                <span className="text-[12px] text-zinc-400">Tagline</span>
                <input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
                />
              </label>
              <label className="block">
                <span className="text-[12px] text-zinc-400">Location</span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, country"
                  className="mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
                />
              </label>
              <label className="block">
                <span className="text-[12px] text-zinc-400">Website</span>
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://…"
                  className="mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
                />
              </label>
              <label className="block">
                <span className="text-[12px] text-zinc-400">About</span>
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={4}
                  className="mt-1.5 w-full rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40"
                />
              </label>

              {error && <p className="text-[13px] text-red-400">{error}</p>}
              {ok && (
                <p className="text-[13px] text-emerald-400">Saved</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black disabled:opacity-60"
              >
                {loading ? "Saving…" : "Save changes"}
              </button>
            </form>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}
