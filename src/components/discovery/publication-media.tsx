import {
  PUBLICATION_LABELS,
  entityPath,
  publicationPath,
  type Publication,
  type DiscoveryEntity,
} from "@/lib/discovery/types";
import { publicationsByPublisher } from "@/lib/discovery/seed";
import { MusicRelease } from "@/components/discovery/music-release";
import { VideoWatch } from "@/components/discovery/video-watch";

type Props = {
  p: Publication & { mediaUrl?: string | null; coverUrl?: string | null };
  publisher: DiscoveryEntity | null | undefined;
  publisherName: string;
  path: string;
  coverUrl?: string | null;
  mediaUrl?: string | null;
  isAudio?: boolean;
  isDirectVideo?: boolean;
  isEmbed?: boolean;
  embedSrc?: string | null;
};

function parseMeta(meta: string | undefined | null): Record<string, string> {
  if (!meta) return {};
  try {
    const o = JSON.parse(meta);
    if (o && typeof o === "object") {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(o)) {
        if (v != null && String(v).trim()) out[k] = String(v).trim();
      }
      return out;
    }
  } catch {
    /* ignore */
  }
  return {};
}

function parseChapters(raw: string | undefined): { time: string; label: string }[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+)$/);
      if (m) return { time: m[1], label: m[2] };
      return null;
    })
    .filter(Boolean) as { time: string; label: string }[];
}

export function PublicationMedia({
  p,
  publisher,
  publisherName,
  path,
  coverUrl,
  mediaUrl,
  isAudio,
  isDirectVideo,
  isEmbed,
  embedSrc,
}: Props) {
  const meta = parseMeta(p.meta);

  // Explicit type wins so discovery-media URLs are not misclassified
  if (p.type === "video" || isDirectVideo || isEmbed) {
    const chapters = parseChapters(meta.chapters);
    return (
      <VideoWatch
        title={p.title}
        publisher={publisherName}
        publisherHref={publisher ? entityPath(publisher) : undefined}
        mediaUrl={mediaUrl || meta.videoUrl || null}
        coverUrl={coverUrl}
        durationLabel={meta.duration || null}
        about={p.summary || p.excerpt || null}
        chapters={chapters}
        tags={p.tags || []}
      />
    );
  }

  if (isEmbed && embedSrc) {
    return (
      <div className="mb-8 overflow-hidden rounded-2xl">
        <div className="aspect-video w-full">
          <iframe
            src={embedSrc}
            title={p.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (p.type === "music" || isAudio) {
    return (
      <MusicRelease
        title={p.title}
        artist={publisherName}
        artistHref={publisher ? entityPath(publisher) : undefined}
        coverUrl={coverUrl}
        mediaUrl={mediaUrl}
        genre={p.category || meta.genre || (p.tags || [])[0] || null}
        releaseDate={p.publishedAt}
        slug={p.slug}
        path={path}
        about={p.summary || p.excerpt || null}
        explore={[
          ...(publisher
            ? [
                {
                  label: `More from ${publisher.name}`,
                  href: entityPath(publisher),
                  kind: "Artist",
                },
              ]
            : []),
          ...publicationsByPublisher(p.publisherId || "")
            .filter((x) => x.slug !== p.slug)
            .slice(0, 4)
            .map((x) => ({
              label: x.title,
              href: publicationPath(x),
              kind: PUBLICATION_LABELS[x.type] || x.type,
            })),
        ]}
      />
    );
  }

  return null;
}
