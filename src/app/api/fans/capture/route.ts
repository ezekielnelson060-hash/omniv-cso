import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scoreAfterAction, tierFromScore } from "@/lib/fan-engagement";
import { trackServer } from "@/lib/analytics";

/**
 * Public fan capture endpoint.
 * POST { artistSlug, email, phone?, consent, source?, city?, wouldAttend? }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      artistSlug?: string;
      email?: string;
      phone?: string;
      firstName?: string;
      consent?: boolean;
      source?: string;
      campaignId?: string;
      city?: string;
      countryCode?: string;
      wouldAttend?: boolean;
    };

    const email = body.email?.trim().toLowerCase();
    const slug = body.artistSlug?.trim().toLowerCase();
    if (!email || !slug) {
      return NextResponse.json(
        { error: "email and artistSlug required" },
        { status: 400 }
      );
    }
    if (!body.consent) {
      return NextResponse.json({ error: "Consent required" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !service) {
      return NextResponse.json(
        {
          error:
            "Server missing SUPABASE_SERVICE_ROLE_KEY — add it in Vercel env and redeploy",
        },
        { status: 503 }
      );
    }

    const admin = createClient(url, service, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let artist: { id: string; stage_name: string } | null = null;
    let lookupErr: string | null = null;

    const exact = await admin
      .from("roster_artists")
      .select("id, stage_name, slug")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();

    if (exact.error) {
      lookupErr = exact.error.message;
    } else if (exact.data) {
      artist = exact.data;
    } else {
      const fuzzy = await admin
        .from("roster_artists")
        .select("id, stage_name, slug")
        .ilike("slug", slug)
        .limit(1)
        .maybeSingle();
      if (fuzzy.error) lookupErr = fuzzy.error.message;
      else if (fuzzy.data) artist = fuzzy.data;
    }

    if (!artist) {
      void trackServer({
        name: "fan_capture_miss",
        path: `/f/${slug}`,
        meta: { slug },
      });
      return NextResponse.json(
        {
          error: lookupErr
            ? `Database error: ${lookupErr}`
            : `No roster artist with slug "${slug}". Check SELECT slug FROM roster_artists;`,
          slug,
        },
        { status: 404 }
      );
    }

    const score = scoreAfterAction(0, "form_submit");
    const tier = tierFromScore(score, true);

    const { data: fan, error: fErr } = await admin
      .from("fans")
      .upsert(
        {
          artist_id: artist.id,
          email,
          phone_number: body.phone || null,
          first_name: body.firstName || null,
          city: body.city || null,
          country_code: body.countryCode || null,
          would_attend: Boolean(body.wouldAttend),
          opt_in_consent: true,
          is_email_subscribed: true,
          acquisition_source: body.source || "landing",
          engagement_score: score,
          fan_tier: tier,
          last_active_at: new Date().toISOString(),
        },
        { onConflict: "artist_id,email" }
      )
      .select("id")
      .single();

    if (fErr || !fan) {
      console.error(fErr);
      return NextResponse.json(
        { error: fErr?.message || "Could not save fan" },
        { status: 500 }
      );
    }

    await admin.from("fan_interactions").insert({
      fan_id: fan.id,
      campaign_id: body.campaignId || null,
      action_type: "form_submit",
      metadata: {
        source: body.source || "landing",
        wouldAttend: Boolean(body.wouldAttend),
        city: body.city || null,
      },
    });

    void trackServer({
      name: "fan_captured",
      path: `/f/${slug}`,
      meta: {
        slug,
        source: body.source || "landing",
        artist: artist.stage_name,
      },
    });

    let reward: string | null = null;
    if (body.campaignId) {
      const { data: camp } = await admin
        .from("campaigns")
        .select("destination_value, type, is_active")
        .eq("id", body.campaignId)
        .maybeSingle();
      if (camp?.is_active) reward = camp.destination_value;
    }

    return NextResponse.json({
      ok: true,
      artist: artist.stage_name,
      reward,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Capture failed" }, { status: 500 });
  }
}
