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
  links?: { label: string; href: string }[];
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
  const [xUrl, setXUrl] = useState("");
  const [linkedin, setLinkedin] = useState("");
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
        const links = found.links || [];
        const web = links.find(
          (l) =>
            l.label === "Website" ||
            (!l.href.includes("x.com") &&
              !l.href.includes("twitter.com") &&
              !l.href.includes("linkedin.com"))
        );
        const x = links.find(
          (l) => l.href.includes("x.com") || l.href.includes("twitter.com")
        );
        const li = links.find((l) => l.href.includes("linkedin.com"));
        setWebsite(web?.href || "");
        setXUrl(x?.href || "");
        setLinkedin(li?.href || "");
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

    const links: { label: string; href: string }[] = [];
    if (website.trim()) {
      const h = website.trim();
      links.push({
        label: "Website",
        href: h.startsWith("http") ? h : `https://${h}`,
      });
    }
    if (xUrl.trim()) {
      const h = xUrl.trim();
      links.push({
        label: "X",
        href: h.startsWith("http") ? h : `https://${h}`,
      });
    }
    if (linkedin.trim()) {
      const h = linkedin.trim();
      links.push({
        label: "LinkedIn",
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
      setOk(true);
      if (data.path) {
        setTimeout(() => router.push(data.path), 500);
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
        <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#050505]/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3 md:max-w-2xl">
            <div className="flex items-center gap-3">
              <Link
                href={entity?.path || `/e/${type}/${slug}`}
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-white/5"
              >
                ←
              </Link>
              <h1 className="text-[16px] font-semibold text-white">
                Edit profile
              </h1>
            </div>
            <button
              type="submit"
              form="entity-edit-form"
              disabled={loading || !entity}
              className="rounded-full bg-omniv-gold px-4 py-1.5 text-[13px] font-semibold text-black disabled:opacity-50"
            >
              {loading ? "Saving…" : "Save"}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-lg px-0 pb-28 md:max-w-2xl">
          {error && !entity && (
            <p className="px-4 pt-8 text-center text-[14px] text-red-400">
              {error}
            </p>
          )}

          {entity && (
            <form id="entity-edit-form" onSubmit={onSave} className="space-y-0">
              {/* Banner — full width rectangular */}
              <div className="relative">
                <CoverUpload
                  label="Change cover"
                  value={coverUrl}
                  onChange={setCoverUrl}
                />
                <div className="absolute -bottom-10 left-4 z-10">
                  <div className="relative">
                    <div className="flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-full bg-omniv-gold/20 text-2xl font-semibold text-omniv-gold ring-4 ring-[#050505]">
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
                  </div>
                </div>
              </div>

              <div className="space-y-5 px-4 pt-14">
                <div>
                  <p className="mb-1.5 text-[12px] text-zinc-500">Avatar</p>
                  <CoverUpload
                    label="Upload photo"
                    tall
                    value={avatarUrl}
                    onChange={setAvatarUrl}
                  />
                </div>

                <Field label="Name">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputCls}
                  />
                </Field>

                <Field label="Bio">
                  <textarea
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    rows={3}
                    maxLength={280}
                    placeholder="Tell people who this is"
                    className={inputCls + " py-2.5"}
                  />
                  <p className="mt-1 text-right text-[11px] text-zinc-600">
                    {tagline.length}/280
                  </p>
                </Field>

                <Field label="Location">
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, country"
                    className={inputCls}
                  />
                </Field>

                <Field label="Website">
                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://…"
                    className={inputCls}
                  />
                </Field>

                <Field label="X">
                  <input
                    value={xUrl}
                    onChange={(e) => setXUrl(e.target.value)}
                    placeholder="https://x.com/…"
                    className={inputCls}
                  />
                </Field>

                <Field label="LinkedIn">
                  <input
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/…"
                    className={inputCls}
                  />
                </Field>

                <Field label="About">
                  <textarea
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    rows={5}
                    placeholder="Longer story — shows on About tab"
                    className={inputCls + " py-2.5"}
                  />
                </Field>

                {error && (
                  <p className="text-[13px] text-red-400">{error}</p>
                )}
                {ok && (
                  <p className="text-[13px] text-emerald-400">Saved</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 w-full items-center justify-center rounded-full bg-omniv-gold text-[15px] font-semibold text-black disabled:opacity-60"
                >
                  {loading ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          )}
        </main>

        <BottomNav />
      </div>
    </DiscoveryShell>
  );
}

const inputCls =
  "mt-1.5 h-11 w-full rounded-xl bg-white/[0.04] px-3.5 text-[14px] text-white outline-none ring-1 ring-white/[0.08] focus:ring-omniv-gold/40";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[12px] text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
