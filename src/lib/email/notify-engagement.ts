/**
 * Fire-and-forget engagement emails.
 * Never throws into the request path; logs soft failures.
 */

import {
  sendFollowEmail,
  sendLikeEmail,
  sendPublishedSuccessEmail,
} from "./engagement";

type SupabaseLike = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (table: string) => any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  auth?: { admin?: { getUserById?: (id: string) => Promise<any> } };
};

async function profileEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<{ email?: string; name?: string } | null> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .maybeSingle();
    if (data?.email) {
      return {
        email: data.email as string,
        name: (data.full_name as string) || undefined,
      };
    }
  } catch {
    /* soft */
  }
  return null;
}

async function actorDisplayName(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string
): Promise<string | undefined> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();
    if (data?.full_name) return data.full_name as string;
  } catch {
    /* soft */
  }
  return undefined;
}

/** After a successful follow insert. */
export function notifyFollowAsync(opts: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  actorUserId: string;
  targetType: string;
  targetSlug: string;
  targetName?: string;
  targetId?: string | null;
}) {
  void (async () => {
    try {
      const { supabase, actorUserId, targetType, targetSlug, targetName, targetId } =
        opts;

      let ownerId: string | null = null;

      if (targetType === "entity" || targetType === "publisher") {
        const idOrSlug = targetId || targetSlug;
        const { data: ent } = await supabase
          .from("discovery_entities")
          .select("owner_id, name, slug")
          .or(`id.eq.${idOrSlug},slug.eq.${targetSlug}`)
          .maybeSingle();
        ownerId = ent?.owner_id || null;
      } else if (targetType === "user" || targetType === "person") {
        // target_id or slug may be user id
        ownerId = targetId || targetSlug;
      }

      if (!ownerId || ownerId === actorUserId) return;

      const recipient = await profileEmail(supabase, ownerId);
      if (!recipient?.email) return;

      const actorName = await actorDisplayName(supabase, actorUserId);

      await sendFollowEmail({
        to: recipient.email,
        recipientName: recipient.name,
        actorName,
        targetKind: targetType === "entity" || targetType === "publisher" ? "entity" : "user",
        targetName: targetName || targetSlug,
        href: `${process.env.NEXT_PUBLIC_APP_URL || "https://omniv.media"}/notifications`,
      });
    } catch (e) {
      console.error("notifyFollowAsync", e);
    }
  })();
}

/** After a successful like insert. */
export function notifyLikeAsync(opts: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  actorUserId: string;
  publicationSlug: string;
  publicationType?: string;
}) {
  void (async () => {
    try {
      const { supabase, actorUserId, publicationSlug } = opts;

      const { data: pub } = await supabase
        .from("discovery_publications")
        .select("owner_id, title, slug")
        .eq("slug", publicationSlug)
        .maybeSingle();

      if (!pub?.owner_id || pub.owner_id === actorUserId) return;

      const recipient = await profileEmail(supabase, pub.owner_id as string);
      if (!recipient?.email) return;

      const actorName = await actorDisplayName(supabase, actorUserId);

      await sendLikeEmail({
        to: recipient.email,
        recipientName: recipient.name,
        actorName,
        publicationTitle: (pub.title as string) || undefined,
        publicationSlug: (pub.slug as string) || publicationSlug,
      });
    } catch (e) {
      console.error("notifyLikeAsync", e);
    }
  })();
}

/** After a successful publish (status published). */
export function notifyPublishedAsync(opts: {
  to: string;
  recipientName?: string;
  title: string;
  slug: string;
  path?: string;
}) {
  void (async () => {
    try {
      await sendPublishedSuccessEmail(opts);
    } catch (e) {
      console.error("notifyPublishedAsync", e);
    }
  })();
}
