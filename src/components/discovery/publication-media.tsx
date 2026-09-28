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
        genre={p.category || (p.tags || [])[0] || null}
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

  if (p.type === "video" || isDirectVideo) {
    return (
      <VideoWatch
        title={p.title}
        publisher={publisherName}
        publisherHref={publisher ? entityPath(publisher) : undefined}
        mediaUrl={mediaUrl}
        coverUrl={coverUrl}
        about={p.summary || p.excerpt || null}
        tags={p.tags || []}
      />
    );
  }

  return null;
}
