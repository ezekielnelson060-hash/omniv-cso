import { MoreFromPublisher } from "@/components/discovery/more-from-publisher";
import { PublicationBottomActions } from "@/components/discovery/publication-cta-bar";

type MoreItem = {
  slug: string;
  type: string;
  title: string;
  summary?: string | null;
  publisherName?: string | null;
  publisherSlug?: string | null;
  coverUrl?: string | null;
  mediaUrl?: string | null;
  publishedAt?: string | null;
};

/**
 * Same block in two places on the publication page:
 * 1) End of the publication content
 * 2) Bottom of the page (after Keep Exploring)
 */
export function PublicationEngagement({
  publicationType,
  publicationSlug,
  publicationTitle,
  mediaUrl,
  publisherName,
  publisherType,
  publisherSlug,
  publisherId,
  publisherHref,
  showFollow,
  moreItems,
}: {
  publicationType: string;
  publicationSlug: string;
  publicationTitle: string;
  mediaUrl?: string | null;
  publisherName: string;
  publisherType: string;
  publisherSlug: string;
  publisherId?: string;
  publisherHref?: string | null;
  showFollow: boolean;
  moreItems: MoreItem[];
}) {
  return (
    <div className="mt-10 space-y-2">
      <MoreFromPublisher
        publisherName={publisherName}
        profileHref={publisherHref}
        items={moreItems}
      />
      <PublicationBottomActions
        publicationType={publicationType}
        publicationSlug={publicationSlug}
        publicationTitle={publicationTitle}
        mediaUrl={mediaUrl}
        publisherName={publisherName}
        publisherType={publisherType}
        publisherSlug={publisherSlug}
        publisherId={publisherId}
        showFollow={showFollow}
      />
    </div>
  );
}
