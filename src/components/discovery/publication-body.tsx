import { ArticleContent, ArticleSources } from "@/components/discovery/article-content";
import { bodyFor } from "@/lib/discovery/seed-bodies";
import type { ArticleContentBlock, ArticleSource } from "@/lib/discovery/types";

type Props = {
  slug: string;
  type: string;
  summary?: string;
  excerpt?: string;
  body?: string;
  content?: ArticleContentBlock[];
  whatThisMeans?: string;
  questionNobodyAsks?: string;
  sources?: ArticleSource[];
};

/** Merges live publication content with dense seed bodies after click */
export function PublicationBody({
  slug,
  type,
  summary,
  excerpt,
  body,
  content,
  whatThisMeans,
  questionNobodyAsks,
  sources,
}: Props) {
  const seed = bodyFor(slug);
  const displayBody = body || seed?.body;
  const displayContent =
    content && content.length ? content : seed?.content;
  const displayWhat = whatThisMeans || seed?.whatThisMeans;
  const displayQuestion = questionNobodyAsks || seed?.questionNobodyAsks;

  return (
    <>
      <p className="text-[19px] font-medium leading-[1.75] text-zinc-200">
        {excerpt || summary}
      </p>

      {(displayContent || displayBody) && (
        <div className="mt-8">
          <ArticleContent content={displayContent} body={displayBody} />
        </div>
      )}

      {(displayWhat || displayQuestion) && (
        <>
          {displayWhat && (
            <section className="mt-16 border-t border-white/10 pt-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
                What this means
              </p>
              <p className="mt-3 text-[18px] leading-relaxed text-zinc-200">
                {displayWhat}
              </p>
            </section>
          )}
          {displayQuestion && (
            <section className="mt-8 rounded-2xl border border-omniv-gold/30 bg-omniv-gold/[0.06] p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-omniv-gold">
                The question nobody asks
              </p>
              <p className="mt-3 text-[20px] font-medium leading-snug text-white">
                {displayQuestion}
              </p>
            </section>
          )}
          <ArticleSources sources={sources} />
        </>
      )}
    </>
  );
}
