import { track } from "@/lib/analytics";

export type CheckoutPlan = "starter" | "pro" | "label";

export async function startFlutterwaveCheckout(opts: {
  plan: CheckoutPlan;
  email?: string;
  name?: string;
}): Promise<{ ok: true; link: string } | { ok: false; error: string }> {
  try {
    track("checkout_start", { plan: opts.plan });
    const res = await fetch("/api/billing/flutterwave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });
    const data = (await res.json()) as { link?: string; error?: string };
    if (!res.ok || !data.link) {
      track("checkout_error", {
        plan: opts.plan,
        error: data.error || "init_failed",
      });
      return {
        ok: false,
        error: data.error || "Could not start checkout. Check FLW_SECRET_KEY.",
      };
    }
    track("checkout_redirect", { plan: opts.plan });
    return { ok: true, link: data.link };
  } catch {
    track("checkout_error", { plan: opts.plan, error: "network" });
    return { ok: false, error: "Network error starting checkout" };
  }
}
