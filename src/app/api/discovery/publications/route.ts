import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/discovery/db";
import {
  PUBLICATION_TYPES,
  type PublicationType,
} from "@/lib/discovery/types";

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
    const entityRefs = Array.isArray(body.entityRefs) ? body.entityRefs : [];
    const relatedPublicationIds = Array.isArray(body.relatedPublicationIds)
      ? body.relatedPublicationIds.map((id: unknown) => String(id)).slice(0, 20)
      : [];
    const status = ["draft", "published", "archived"].includes(String(body.status))
      ? String(body.status)
      : "published";

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
      entity_refs: entityRefs,
      related_publication_ids: relatedPublicationIds,
      tags,
      meta,
      heat: 10,
    };
    if (type === "article") {
      insertRow.author_profile_id = user.id;
      insertRow.subtitle = body.subtitle ? String(body.subtitle).trim() : null;
      insertRow.excerpt = body.excerpt ? String(body.excerpt).trim() : summary;
      insertRow.category_id = body.categoryId ? String(body.categoryId).trim() : null;
      insertRow.reading_time = Number.isFinite(Number(body.readingTime))
        ? Math.max(1, Math.round(Number(body.readingTime)))
        : null;
      insertRow.seo_title = body.seoTitle ? String(body.seoTitle).trim() : null;
      insertRow.seo_description = body.seoDescription
        ? String(body.seoDescription).trim()
        : null;
      insertRow.canonical_url = body.canonicalUrl
        ? String(body.canonicalUrl).trim()
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

    return NextResponse.json({ ok: true, path: `/p/${data.slug}` });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ publications: [], auth: false }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const publisherId = searchParams.get("publisherId");
    const id = searchParams.get("id");
    const status = searchParams.get("status");
    let query = supabase
      .from("discovery_publications")
      .select("id, type, slug, title, summary, body, subtitle, publisher_id, publisher_name, status, updated_at, published_at, heat, tags, cover_url, media_url, entity_refs, seo_title, seo_description, category_id")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(100);
    if (!id) query = publisherId ? query.eq("publisher_id", publisherId) : query.is("publisher_id", null);
    if (id) query = query.eq("id", id);
    if (["draft", "published", "archived"].includes(status || "")) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) return NextResponse.json({ publications: [], error: error.message }, { status: 500 });
    return NextResponse.json({
      auth: true,
      publications: (data || []).map((publication) => ({
        id: publication.id,
        type: publication.type,
        slug: publication.slug,
        title: publication.title,
        summary: publication.summary,
        body: publication.body,
        subtitle: publication.subtitle,
        publisherId: publication.publisher_id,
        publisherName: publication.publisher_name,
        status: publication.status || "published",
        updatedAt: publication.updated_at,
        publishedAt: publication.published_at,
        heat: publication.heat,
        tags: publication.tags || [],
        coverUrl: publication.cover_url,
        mediaUrl: publication.media_url,
        entityRefs: publication.entity_refs || [],
        seoTitle: publication.seo_title,
        seoDescription: publication.seo_description,
        categoryId: publication.category_id,
      })),
    });
  } catch (error) {
    console.error("publication list", error);
    return NextResponse.json({ publications: [] }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    const body = await req.json();
    const id = String(body.id || "").trim();
    const status = String(body.status || "");
    if (!id || !["draft", "published", "archived"].includes(status)) {
      return NextResponse.json({ error: "Publication id and valid status required" }, { status: 400 });
    }
    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === "published") updates.published_at = new Date().toISOString();
    const { data, error } = await supabase
      .from("discovery_publications")
      .update(updates)
      .eq("id", id)
      .eq("owner_id", user.id)
      .select("id, slug, status")
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Publication not found" }, { status: 404 });
    return NextResponse.json({ ok: true, publication: data, path: `/p/${data.slug}` });
  } catch (error) {
    console.error("publication update", error);
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
    const { error } = await supabase
      .from("discovery_publications")
      .delete()
      .eq("id", id)
      .eq("owner_id", user.id)
      .eq("status", "draft");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("publication delete", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
