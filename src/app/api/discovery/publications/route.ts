import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/discovery/db";
import {
  PUBLICATION_TYPES,
  type PublicationType,
} from "@/lib/discovery/types";
import { buildPublicationSeo } from "@/lib/discovery/seo";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await req.json();
    const type = body.type as PublicationType;
    const title = String(body.title || "").trim();
    const summary = String(body.summary || "").trim();
    const content = String(body.body || "").trim();
    let publisherName = String(body.publisherName || "").trim();
    const requestedPublisherId = body.publisherId
      ? String(body.publisherId).trim()
      : null;
    const meta = String(body.meta || "").trim() || null;
    const tagsRaw = String(body.tags || "");
    const coverUrl = body.coverUrl ? String(body.coverUrl).trim() : null;
    const mediaUrl = body.mediaUrl ? String(body.mediaUrl).trim() : null;
    const visibility = body.visibility === "private" ? "private" : "public";
    const opportunityType = body.opportunityType
      ? String(body.opportunityType).trim()
      : null;
    const entityRefs = Array.isArray(body.entityRefs) ? body.entityRefs : [];
    const relatedPublicationIds = Array.isArray(body.relatedPublicationIds)
      ? body.relatedPublicationIds.map((id: unknown) => String(id)).slice(0, 20)
      : [];
    let status = ["draft", "published", "archived", "scheduled"].includes(
      String(body.status)
    )
      ? String(body.status)
      : "published";
    const scheduledRaw = body.scheduledAt ? String(body.scheduledAt).trim() : "";
    let publishedAt = new Date().toISOString();
    if (scheduledRaw) {
      const when = new Date(scheduledRaw);
      if (
        !Number.isNaN(when.getTime()) &&
        when.getTime() > Date.now() + 60_000
      ) {
        status = "scheduled";
        publishedAt = when.toISOString();
      }
    }

    if (!(PUBLICATION_TYPES as readonly string[]).includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    if (!title || title.length < 2) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }
    if (!summary) {
      return NextResponse.json({ error: "Summary required" }, { status: 400 });
    }

    let slug = slugify(title) || `pub-${Date.now()}`;
    const tags = tagsRaw
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean)
      .slice(0, 12);

    for (let i = 0; i < 5; i++) {
      const trySlug = i === 0 ? slug : `${slug}-${i + 1}`;
      const { data: existing } = await supabase
        .from("discovery_publications")
        .select("id")
        .eq("slug", trySlug)
        .maybeSingle();
      if (!existing) {
        slug = trySlug;
        break;
      }
    }

    let publisherId: string | null = null;

    if (requestedPublisherId) {
      const { data: owned } = await supabase
        .from("discovery_entities")
        .select("id, name")
        .eq("id", requestedPublisherId)
        .eq("owner_id", user.id)
        .maybeSingle();
      if (owned?.id) {
        publisherId = owned.id;
        publisherName = owned.name || publisherName;
      }
    }

    if (!publisherId) {
      publisherName = String(
        user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Personal"
      );
    }

    const insertRow: Record<string, unknown> = {
      owner_id: user.id,
      publisher_id: publisherId,
      publisher_name: publisherName || "Publisher",
      type,
      slug,
      title,
      summary,
      body: content || null,
      status,
      published_at: publishedAt,
      entity_refs: entityRefs,
      related_publication_ids: relatedPublicationIds,
      tags,
      meta,
      heat: 10,
      visibility,
    };

    // Auto SEO for every public publication type
    {
      const seo = buildPublicationSeo({
        type,
        title,
        summary,
        excerpt: body.excerpt ? String(body.excerpt).trim() : summary,
        body: content,
        tags,
        publisherName: publisherName || undefined,
        slug,
        coverUrl,
        seoTitle: body.seoTitle ? String(body.seoTitle).trim() : null,
        seoDescription: body.seoDescription
          ? String(body.seoDescription).trim()
          : null,
        canonicalUrl: body.canonicalUrl
          ? String(body.canonicalUrl).trim()
          : null,
      });
      insertRow.seo_title = seo.seoTitle;
      insertRow.seo_description = seo.seoDescription;
      insertRow.canonical_url = seo.canonicalUrl;
    }

    if (type === "article") {
      insertRow.author_profile_id = user.id;
      insertRow.subtitle = body.subtitle ? String(body.subtitle).trim() : null;
      insertRow.excerpt = body.excerpt ? String(body.excerpt).trim() : summary;
      insertRow.category_id = body.categoryId
        ? String(body.categoryId).trim()
        : null;
      insertRow.reading_time = Number.isFinite(Number(body.readingTime))
        ? Math.max(1, Math.round(Number(body.readingTime)))
        : null;
      insertRow.what_this_means = body.whatThisMeans
        ? String(body.whatThisMeans).trim()
        : null;
      insertRow.question_nobody_asks = body.questionNobodyAsks
        ? String(body.questionNobodyAsks).trim()
        : null;
      if (Array.isArray(body.content)) insertRow.content = body.content;
      if (Array.isArray(body.sources)) insertRow.sources = body.sources;
    }
    if (coverUrl) insertRow.cover_url = coverUrl;
    if (mediaUrl) insertRow.media_url = mediaUrl;
    if (type === "opportunity" && opportunityType)
      insertRow.opportunity_type = opportunityType;

    const { data, error } = await supabase
      .from("discovery_publications")
      .insert(insertRow)
      .select("slug")
      .single();

    if (error) {
      console.error("publication insert", error);
      return NextResponse.json(
        {
          error:
            error.message.includes("relation") || error.code === "42P01"
              ? "Run migration 031_discovery_publications.sql in Supabase first"
              : error.message,
        },
        { status: 500 }
      );
    }

    const publicPath = buildPublicationSeo({
      type,
      title,
      summary,
      slug: data.slug,
      tags,
      publisherName: publisherName || undefined,
      coverUrl,
    }).path;
    return NextResponse.json({ ok: true, path: publicPath, slug: data.slug });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json(
        { publications: [], auth: false },
        { status: 401 }
      );
    const { searchParams } = new URL(req.url);
    const publisherId = searchParams.get("publisherId");
    const id = searchParams.get("id");
    const status = searchParams.get("status");
    let query = supabase
      .from("discovery_publications")
      .select(
        "id, type, slug, title, summary, body, subtitle, excerpt, publisher_id, publisher_name, status, updated_at, published_at, heat, tags, cover_url, media_url, entity_refs, related_publication_ids, seo_title, seo_description, category_id, reading_time, what_this_means, question_nobody_asks, sources, content, visibility"
      )
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(100);
    if (!id)
      query = publisherId
        ? query.eq("publisher_id", publisherId)
        : query.is("publisher_id", null);
    if (id) query = query.eq("id", id);
    if (["draft", "published", "archived", "scheduled"].includes(status || ""))
      query = query.eq("status", status);
    const { data, error } = await query;
    if (error)
      return NextResponse.json(
        { publications: [], error: error.message },
        { status: 500 }
      );
    return NextResponse.json({
      auth: true,
      publications: (data || []).map((publication) => ({
        id: publication.id,
        type: publication.type,
        slug: publication.slug,
        title: publication.title,
        summary: publication.summary,
        status: publication.status,
        publishedAt: publication.published_at,
        path: buildPublicationSeo({
          type: publication.type as PublicationType,
          title: publication.title,
          summary: publication.summary || "",
          slug: publication.slug,
        }).path,
        visibility: publication.visibility || "public",
        publisherId: publication.publisher_id,
        body: publication.body,
        subtitle: publication.subtitle,
        excerpt: publication.excerpt,
        tags: publication.tags || [],
        coverUrl: publication.cover_url,
        mediaUrl: publication.media_url,
        entityRefs: publication.entity_refs || [],
        relatedPublicationIds: publication.related_publication_ids || [],
        content: publication.content || [],
        sources: publication.sources || [],
      })),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    const body = await req.json();
    const id = String(body.id || "").trim();
    if (!id) return NextResponse.json({ error: "Publication id required" }, { status: 400 });
    const patch: Record<string, unknown> = {};
    const fields: Record<string, string> = {
      title: "title", summary: "summary", body: "body", publisherName: "publisher_name",
      meta: "meta", coverUrl: "cover_url", mediaUrl: "media_url", visibility: "visibility", status: "status",
      subtitle: "subtitle", excerpt: "excerpt", seoTitle: "seo_title", seoDescription: "seo_description",
      canonicalUrl: "canonical_url", whatThisMeans: "what_this_means", questionNobodyAsks: "question_nobody_asks",
    };
    for (const [input, column] of Object.entries(fields)) if (body[input] !== undefined) patch[column] = body[input];
    if (patch.visibility && !["public", "private"].includes(String(patch.visibility))) return NextResponse.json({ error: "Invalid visibility" }, { status: 400 });
    if (patch.status && !["draft", "published", "archived", "scheduled"].includes(String(patch.status))) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    if (body.tags !== undefined) patch.tags = Array.isArray(body.tags) ? body.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean).slice(0, 12) : String(body.tags).split(",").map((tag: string) => tag.trim()).filter(Boolean).slice(0, 12);
    if (body.entityRefs !== undefined) patch.entity_refs = Array.isArray(body.entityRefs) ? body.entityRefs : [];
    if (body.relatedPublicationIds !== undefined) patch.related_publication_ids = Array.isArray(body.relatedPublicationIds) ? body.relatedPublicationIds.slice(0, 20) : [];
    if (body.content !== undefined) patch.content = Array.isArray(body.content) ? body.content : [];
    if (body.sources !== undefined) patch.sources = Array.isArray(body.sources) ? body.sources : [];
    patch.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from("discovery_publications").update(patch).eq("id", id).eq("owner_id", user.id).select("id, slug, status, visibility").maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Publication not found or not yours" }, { status: 404 });
    return NextResponse.json({ ok: true, publication: data, path: `/p/${data.slug}` });
  } catch (e) {
    console.error("publication patch", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Publication id required" }, { status: 400 });
    const { data: existing } = await supabase.from("discovery_publications").select("id").eq("id", id).eq("owner_id", user.id).maybeSingle();
    if (!existing) return NextResponse.json({ error: "Publication not found or not yours" }, { status: 404 });
    const { error } = await supabase.from("discovery_publications").delete().eq("id", id).eq("owner_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("publication delete", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
