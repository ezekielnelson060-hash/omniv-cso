export type CheckoutPlan = "starter" | "pro" | "label";

export async function startFlutterwaveCheckout(opts: {
  plan: CheckoutPlan;
  email?: string;
  name?: string;
}): Promise<{ ok: true; link: string } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/billing/flutterwave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });
    const data = (await res.json()) as { link?: string; error?: string };
    if (!res.ok || !data.link) {
      return {
        ok: false,
        error: data.error || "Could not start checkout. Check FLW_SECRET_KEY.",
      };
    }
    return { ok: true, link: data.link };
  } catch {
    return { ok: false, error: "Network error starting checkout" };
  }
}
