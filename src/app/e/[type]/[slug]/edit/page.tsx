"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BottomNav } from "@/components/discovery/bottom-nav";
import { DiscoveryShell } from "@/components/discovery/desktop-sidebar";

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
  links?: { label: string; href: string }[];
};

async function uploadFile(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/discovery/upload-cover", {
    method: "POST",
    body: fd,
  });
  const data = await res.json();
  if (!res.ok) return null;
  return data.url as string;
}

export default function EditEntityPage() {
  const params = useParams();
  const router = useRouter();
  const type = String(params.type || "");
  const slug = String(params.slug || "");

  const coverRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const [entity, setEntity] = useState<Entity | null>(null);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [website, setWebsite] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const links = found.links || [];
        const web = links.find((l) => l.label === "Website") || links[0];
        setWebsite(web?.href || "");
      } catch {
        setError("Could not load entity");
      }
    })();
  }, [type, slug]);

  async function onPickCover(file?: File) {
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    setUploading(false);
    if (url) setCoverUrl(url);
    else setError("Cover upload failed");
  }

  async function onPickAvatar(file?: File) {
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    setUploading(false);
    if (url) setAvatarUrl(url);
    else setError("Photo upload failed");
  }

  async function onSave(e?: React.FormEvent) {
    e?.preventDefault();
    if (!entity) return;
    setLoading(true);
    setError(null);

    const links: { label: string; href: string }[] = [];
    if (website.trim()) {
      const h = website.trim();
      links.push({
        label: "Website",
        href: h.startsWith("http") ? h : `https://${h}`,
      });
    }

    try {
      const res = await fetch(`/api/discovery/entities/${entity.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tagline,
          location,
          about,
          website: website.trim(),
          links,
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
      router.push(data.path || entity.path);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DiscoveryShell>
      <div className="min-h-dvh bg-black text-zinc-100">
        {/* X-style top bar */}
        <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-black/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-2xl">
            <div className="flex items-center gap-4">
              <Link
                href={entity?.path || `/e/${type}/${slug}`}
                className="text-[20px] text-white"
                aria-label="Back"
              >
                ←
              </Link>
              <h1 className="text-[17px] font-bold text-white">Edit profile</h1>
            </div>
            <button
              type="button"
              onClick={() => void onSave()}
              disabled={loading || !entity || uploading}
              className="text-[15px] font-bold text-white disabled:opacity-40"
            >
              {loading ? "Saving…" : "Save"}
            </button>
          </div>
        </header>

        {error && !entity && (
          <p className="px-4 pt-10 text-center text-[14px] text-red-400">
            {error}
          </p>
        )}

        {entity && (
          <form onSubmit={onSave} className="mx-auto max-w-lg pb-28 md:max-w-2xl">
            {/* Cover + avatar stacked like X */}
            <div className="relative">
              <button
                type="button"
                onClick={() => coverRef.current?.click()}
                className="relative aspect-[3/1] w-full overflow-hidden bg-zinc-900"
              >
                {coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-zinc-800" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-xl text-white">
                    ⌕+
                  </span>
                </div>
              </button>
              <input
                ref={coverRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void onPickCover(e.target.files?.[0])}
              />

              <button
                type="button"
                onClick={() => avatarRef.current?.click()}
                className="absolute -bottom-10 left-4 flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-full bg-zinc-800 ring-4 ring-black"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-semibold text-zinc-500">
                    {name.charAt(0) || "?"}
                  </span>
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-lg text-white">
                  ⌕+
                </span>
              </button>
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void onPickAvatar(e.target.files?.[0])}
              />
            </div>

            {/* Flat fields like X */}
            <div className="mt-14 space-y-0 px-4">
              {uploading && (
                <p className="mb-3 text-[13px] text-zinc-500">Uploading…</p>
              )}

              <FlatField label="Name">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={flatInput}
                />
              </FlatField>

              <FlatField label="Bio">
                <textarea
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  rows={3}
                  maxLength={280}
                  className={flatInput + " resize-none py-1"}
                />
              </FlatField>

              <FlatField label="Location">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location"
                  className={flatInput}
                />
              </FlatField>

              <FlatField label="Website">
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://"
                  className={flatInput}
                />
              </FlatField>

              <FlatField label="About">
                <textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={4}
                  placeholder="Longer about (About tab)"
                  className={flatInput + " resize-none py-1"}
                />
              </FlatField>

              {error && (
                <p className="pt-3 text-[13px] text-red-400">{error}</p>
              )}

              {coverUrl && (
                <button
                  type="button"
                  onClick={() => setCoverUrl(null)}
                  className="mt-4 text-[13px] text-zinc-500 hover:text-white"
                >
                  Remove cover photo
                </button>
              )}
            </div>
          </form>
        )}

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}

const flatInput =
  "w-full bg-transparent text-[16px] text-white outline-none placeholder:text-zinc-600";

function FlatField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block border-b border-white/[0.08] py-3">
      <span className="mb-1 block text-[13px] text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
