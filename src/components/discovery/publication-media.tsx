import {
  entityPath,
  type Publication,
  type DiscoveryEntity,
} from "@/lib/discovery/types";
import { MusicRelease } from "@/components/discovery/music-release";
import { VideoWatch } from "@/components/discovery/video-watch";
import { resolvePublisherPath } from "@/lib/discovery/resolve-publisher";

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
  isOwner?: boolean;
  relatedFromPublisher?: Array<
    Pick<Publication, "slug" | "type" | "title" | "publisherName" | "publisherSlug">
  >;
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

function publisherHrefFor(
  publisher: DiscoveryEntity | null | undefined,
  publisherName: string,
  preferredType = "artist"
): string | undefined {
  if (publisher) return entityPath(publisher);
  return resolvePublisherPath({
    name: publisherName,
    type: preferredType,
    slug: undefined,
  });
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
  isOwner = false,
}: Props) {
  const meta = parseMeta(p.meta);
  const artistHref = publisherHrefFor(
    publisher,
    publisherName,
    p.type === "music" ? "artist" : publisher?.type || "person"
  );

  if (p.type === "video" || isDirectVideo || isEmbed) {
    const chapters = parseChapters(meta.chapters);
    return (
      <VideoWatch
        title={p.title}
        publisher={publisherName}
        publisherHref={artistHref}
        mediaUrl={mediaUrl || meta.videoUrl || null}
        coverUrl={coverUrl}
        durationLabel={meta.duration || null}
        about={p.summary || p.excerpt || null}
        chapters={chapters}
        tags={p.tags || []}
        publicationSlug={p.slug}
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
        artistHref={artistHref}
        coverUrl={coverUrl}
        mediaUrl={mediaUrl}
        genre={p.category || meta.genre || (p.tags || [])[0] || null}
        releaseDate={p.publishedAt}
        slug={p.slug}
        path={path}
        about={p.summary || p.excerpt || null}
        isOwner={isOwner}
      />
    );
  }

  return null;
}
