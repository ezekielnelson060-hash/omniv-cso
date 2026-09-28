"use client";

import Link from "next/link";

type Chapter = { time: string; label: string };

type Props = {
  title: string;
  publisher: string;
  publisherHref?: string;
  mediaUrl?: string | null;
  coverUrl?: string | null;
  durationLabel?: string | null;
  about?: string | null;
  chapters?: Chapter[];
  tags?: string[];
};

export function VideoWatch({
  title,
  publisher,
  publisherHref,
  mediaUrl,
  coverUrl,
  durationLabel,
  about,
  chapters = [],
  tags = [],
}: Props) {
  const isYoutube =
    mediaUrl &&
    (mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be"));

  return (
    <div className="mb-10 space-y-6">
      <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-white/[0.08]">
        {mediaUrl && !isYoutube ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            controls
            poster={coverUrl || undefined}
            className="aspect-video w-full bg-black"
            src={mediaUrl}
            preload="metadata"
          />
        ) : mediaUrl && isYoutube ? (
          <div className="aspect-video w-full">
            <iframe
              title={title}
              src={youtubeEmbed(mediaUrl)}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-rose-900 to-black">
            {coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-50"
              />
            )}
            <p className="relative text-[14px] text-zinc-300">
              Add a video file or YouTube link on publish
            </p>
          </div>
        )}
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-omniv-gold">
          Video
        </p>
        <h2 className="mt-1 text-[22px] font-semibold text-white sm:text-[26px]">
          {title}
        </h2>
        <p className="mt-1 text-[14px] text-zinc-400">
          {publisherHref ? (
            <Link href={publisherHref} className="hover:text-omniv-gold">
              {publisher}
            </Link>
          ) : (
            publisher
          )}
          {durationLabel ? ` · ${durationLabel}` : ""}
        </p>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 6).map((t) => (
              <span
                key={t}
                className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[11px] text-zinc-400"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {about && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            About
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-zinc-300">{about}</p>
        </div>
      )}

      {chapters.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            Chapters
          </p>
          <ul className="mt-3 space-y-1.5">
            {chapters.map((c) => (
              <li
                key={c.time + c.label}
                className="flex gap-3 text-[13px] text-zinc-400"
              >
                <span className="w-12 shrink-0 tabular-nums text-omniv-gold">
                  {c.time}
                </span>
                <span>{c.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function youtubeEmbed(url: string): string {
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }
    const u = new URL(url);
    const id = u.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch {
    return url;
  }
}
