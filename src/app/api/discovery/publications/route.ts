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

    // Prefer explicit active-account entity (must be owned by user)
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
      if (!publisherName) {
        return NextResponse.json(
          { error: "Select an account to publish as" },
          { status: 400 }
        );
      }
      const pubSlug =
        slugify(publisherName) || `publisher-${user.id.slice(0, 8)}`;
      const { data: existingPub } = await supabase
        .from("discovery_entities")
        .select("id")
        .eq("owner_id", user.id)
        .eq("slug", pubSlug)
        .maybeSingle();

      if (existingPub?.id) {
        publisherId = existingPub.id;
      } else {
        const { data: created, error: entErr } = await supabase
          .from("discovery_entities")
          .insert({
            owner_id: user.id,
            type: "company",
            slug: pubSlug,
            name: publisherName,
            tagline: "Publisher on Omniv",
            about: "",
            intents: [],
            tags: [],
            heat: 5,
          })
          .select("id")
          .single();
        if (entErr) {
          console.error("publisher entity", entErr);
        } else {
          publisherId = created.id;
        }
      }
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
      tags,
      meta,
      heat: 10,
    };
    if (coverUrl) insertRow.cover_url = coverUrl;

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
