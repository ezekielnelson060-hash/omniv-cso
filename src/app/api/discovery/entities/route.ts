import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/discovery/db";
import {
  ENTITY_TYPES,
  INTENT_KINDS,
  PUBLISHER_TYPES,
  type EntityType,
  type IntentKind,
} from "@/lib/discovery/types";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ auth: false, entities: [] });
    }

    const { data, error } = await supabase
      .from("discovery_entities")
      .select(
        "id, type, slug, name, tagline, location, about, intents, tags, heat, published_at, verified"
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("entities list", error);
      // Fallback without verified if column missing
      const retry = await supabase
        .from("discovery_entities")
        .select(
          "id, type, slug, name, tagline, location, about, intents, tags, heat, published_at"
        )
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (retry.error) {
        return NextResponse.json({
          auth: true,
          entities: [],
          error: error.message,
        });
      }

      const entities = (retry.data || []).map((r) => ({
        id: r.id,
        type: r.type,
        slug: r.slug,
        name: r.name,
        tagline: r.tagline,
        location: r.location,
        about: r.about,
        intents: r.intents || [],
        tags: r.tags || [],
        heat: r.heat,
        publishedAt: r.published_at?.slice?.(0, 10),
        verified: false,
        path: `/e/${r.type}/${r.slug}`,
      }));
      return NextResponse.json({ auth: true, entities });
    }

    const entities = (data || []).map((r) => ({
      id: r.id,
      type: r.type,
      slug: r.slug,
      name: r.name,
      tagline: r.tagline,
      location: r.location,
      about: r.about,
      intents: r.intents || [],
      tags: r.tags || [],
      heat: r.heat,
      publishedAt: r.published_at?.slice?.(0, 10),
      verified: Boolean(r.verified),
      path: `/e/${r.type}/${r.slug}`,
    }));

    return NextResponse.json({ auth: true, entities });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ auth: false, entities: [] });
  }
}

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
    const type = body.type as EntityType;
    const name = String(body.name || "").trim();
    const tagline = String(body.tagline || "").trim();
    const about = String(body.about || "").trim();
    const location = String(body.location || "").trim() || null;
    const intentKind = body.intent as IntentKind | undefined;
    const intentDetail = String(body.intentDetail || "").trim() || undefined;
    const tagsRaw = String(body.tags || "");
    const linkHref = String(body.link || "").trim();

    if (!ENTITY_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const isPublisher = (PUBLISHER_TYPES as readonly string[]).includes(type);
    const finalTagline =
      tagline ||
      (isPublisher
        ? type === "person"
          ? "On Omniv"
          : "Publisher on Omniv"
        : "On Omniv");

    let slug = slugify(name) || `entity-${Date.now()}`;
    const intents =
      intentKind && INTENT_KINDS.includes(intentKind)
        ? [{ kind: intentKind, detail: intentDetail }]
        : [];
    const tags = tagsRaw
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean)
      .slice(0, 8);
    const links = linkHref
      ? [
          {
            label: "Website",
            href: linkHref.startsWith("http")
              ? linkHref
              : `https://${linkHref}`,
          },
        ]
      : [];

    for (let i = 0; i < 5; i++) {
      const trySlug = i === 0 ? slug : `${slug}-${i + 1}`;
      const { data: existing } = await supabase
        .from("discovery_entities")
        .select("id")
        .eq("type", type)
        .eq("slug", trySlug)
        .maybeSingle();
      if (!existing) {
        slug = trySlug;
        break;
      }
    }

    const { data, error } = await supabase
      .from("discovery_entities")
      .insert({
        owner_id: user.id,
        type,
        slug,
        name,
        tagline: finalTagline,
        location,
        about: about || finalTagline,
        intents,
        tags,
        links,
        heat: 10,
        verified: false,
      })
      .select("id, type, slug, name")
      .single();

    if (error) {
      console.error("discovery insert", error);
      // Retry without verified column if migration not run
      if (error.message?.includes("verified")) {
        const retry = await supabase
          .from("discovery_entities")
          .insert({
            owner_id: user.id,
            type,
            slug,
            name,
            tagline: finalTagline,
            location,
            about: about || finalTagline,
            intents,
            tags,
            links,
            heat: 10,
          })
          .select("id, type, slug, name")
          .single();
        if (retry.error) {
          return NextResponse.json({ error: retry.error.message }, { status: 500 });
        }
        return NextResponse.json({
          ok: true,
          entity: retry.data,
          path: `/e/${retry.data.type}/${retry.data.slug}`,
        });
      }
      return NextResponse.json(
        {
          error:
            error.message.includes("relation") || error.code === "42P01"
              ? "Run migration 030_discovery_entities.sql in Supabase first"
              : error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      entity: data,
      path: `/e/${data.type}/${data.slug}`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
