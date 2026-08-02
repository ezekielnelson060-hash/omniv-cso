/** Client-side product analytics — fire-and-forget */

export type TrackMeta = Record<string, string | number | boolean | null | undefined>;

export function track(
  name: string,
  meta?: TrackMeta,
  path?: string
): void {
  if (typeof window === "undefined") return;
  const payload = {
    name,
    path: path || window.location.pathname,
    meta: meta || {},
  };
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/events", blob);
      return;
    }
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* never block UX */
  }
}

/** Server-side track (API routes) via service role */
export async function trackServer(opts: {
  name: string;
  userId?: string | null;
  path?: string;
  meta?: TrackMeta;
}): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) return;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(url, service, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await admin.from("app_events").insert({
      name: opts.name,
      user_id: opts.userId || null,
      path: opts.path || null,
      meta: opts.meta || {},
    });
  } catch (e) {
    console.error("trackServer", e);
  }
}
