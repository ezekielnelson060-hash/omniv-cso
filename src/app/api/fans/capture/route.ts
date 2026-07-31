import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scoreAfterAction, tierFromScore } from "@/lib/fan-engagement";

/**
 * Public fan capture endpoint.
 * POST { artistSlug, email, phone?, consent, source?, campaignId? }
 * Uses service role to write under isolated artist_id.
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
      return NextResponse.json(
        { error: "Consent required" },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !service) {
      return NextResponse.json(
        { error: "Server not configured for fan capture" },
        { status: 503 }
      );
    }

    const admin = createClient(url, service, {
      auth: { persistSession: false },
    });

    const { data: artist, error: aErr } = await admin
      .from("roster_artists")
      .select("id, stage_name")
      .eq("slug", slug)
      .maybeSingle();

    if (aErr || !artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
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
      metadata: { source: body.source || "landing" },
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
